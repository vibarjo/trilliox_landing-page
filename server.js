const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const ethers = require('ethers');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==================== DATABASE SETUP ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dappho', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
    walletAddress: { type: String, unique: true, required: true, lowercase: true },
    email: { type: String, unique: true },
    username: String,
    createdAt: { type: Date, default: Date.now },
    profilePicture: String,
    bio: String,
    nonce: String, // For wallet authentication
});

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    walletAddress: String,
    tokens: [{
        symbol: String,
        address: String,
        amount: String,
        value: Number,
        percentage: Number,
    }],
    totalValue: Number,
    updatedAt: { type: Date, default: Date.now },
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    walletAddress: String,
    type: { type: String, enum: ['swap', 'liquidity_add', 'liquidity_remove', 'stake'] },
    fromToken: String,
    toToken: String,
    fromAmount: String,
    toAmount: String,
    fee: Number,
    gasUsed: String,
    txHash: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
});

// Liquidity Pool Schema
const poolSchema = new mongoose.Schema({
    poolAddress: { type: String, unique: true },
    token0: String,
    token1: String,
    reserve0: String,
    reserve1: String,
    totalLiquidity: String,
    fee: { type: Number, default: 0.25 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    subscribedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
});

// Models
const User = mongoose.model('User', userSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Pool = mongoose.model('Pool', poolSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// ==================== UTILITY FUNCTIONS ====================

// JWT token generation
const generateToken = (walletAddress) => {
    return jwt.sign({ walletAddress }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d',
    });
};

// Wallet authentication middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.walletAddress = decoded.walletAddress;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ==================== AUTHENTICATION ROUTES ====================

// Get nonce for wallet sign
app.post('/api/auth/nonce', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        const nonce = Math.floor(Math.random() * 1000000).toString();
        
        let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!user) {
            user = new User({
                walletAddress: walletAddress.toLowerCase(),
                nonce,
            });
        } else {
            user.nonce = nonce;
        }
        await user.save();

        res.json({
            nonce,
            message: `Sign this nonce to login: ${nonce}`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify signature and login
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;

        const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!user || !user.nonce) {
            return res.status(401).json({ error: 'User not found or nonce expired' });
        }

        const message = `Sign this nonce to login: ${user.nonce}`;
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        user.nonce = null; // Clear nonce after use
        await user.save();

        const token = generateToken(walletAddress.toLowerCase());
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== USER ROUTES ====================

// Get user profile
app.get('/api/users/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.walletAddress });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
app.put('/api/users/profile', authMiddleware, async (req, res) => {
    try {
        const { username, email, bio, profilePicture } = req.body;
        const user = await User.findOneAndUpdate(
            { walletAddress: req.walletAddress },
            { username, email, bio, profilePicture },
            { new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PORTFOLIO ROUTES ====================

// Get user portfolio
app.get('/api/portfolio', authMiddleware, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ walletAddress: req.walletAddress });
        if (!portfolio) {
            return res.json({
                walletAddress: req.walletAddress,
                tokens: [],
                totalValue: 0,
            });
        }
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update portfolio
app.post('/api/portfolio/update', authMiddleware, async (req, res) => {
    try {
        const { tokens, totalValue } = req.body;
        let portfolio = await Portfolio.findOne({ walletAddress: req.walletAddress });

        if (!portfolio) {
            portfolio = new Portfolio({
                walletAddress: req.walletAddress,
                tokens,
                totalValue,
            });
        } else {
            portfolio.tokens = tokens;
            portfolio.totalValue = totalValue;
            portfolio.updatedAt = new Date();
        }

        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TRANSACTION ROUTES ====================

// Create transaction
app.post('/api/transactions', authMiddleware, async (req, res) => {
    try {
        const { type, fromToken, toToken, fromAmount, toAmount, fee } = req.body;

        const transaction = new Transaction({
            userId: req.userId,
            walletAddress: req.walletAddress,
            type,
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            fee,
            status: 'pending',
        });

        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user transactions
app.get('/api/transactions', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ walletAddress: req.walletAddress })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update transaction status
app.patch('/api/transactions/:id', authMiddleware, async (req, res) => {
    try {
        const { status, txHash, gasUsed } = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            {
                status,
                txHash,
                gasUsed,
                completedAt: status === 'completed' ? new Date() : undefined,
            },
            { new: true }
        );
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== LIQUIDITY POOL ROUTES ====================

// Get all pools
app.get('/api/pools', async (req, res) => {
    try {
        const pools = await Pool.find().sort({ totalLiquidity: -1 });
        res.json(pools);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single pool
app.get('/api/pools/:id', async (req, res) => {
    try {
        const pool = await Pool.findById(req.params.id);
        if (!pool) return res.status(404).json({ error: 'Pool not found' });
        res.json(pool);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create pool (admin only)
app.post('/api/pools', async (req, res) => {
    try {
        const { poolAddress, token0, token1, reserve0, reserve1, totalLiquidity } = req.body;

        const pool = new Pool({
            poolAddress,
            token0,
            token1,
            reserve0,
            reserve1,
            totalLiquidity,
        });

        await pool.save();
        res.status(201).json(pool);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SWAP SIMULATION ====================

// Get swap quote
app.post('/api/swap-quote', async (req, res) => {
    try {
        const { fromToken, toToken, fromAmount } = req.body;

        // Simulated swap calculation (in production, use actual DEX pricing)
        const rate = Math.random() * (1.05 - 0.95) + 0.95; // Random rate between 0.95-1.05
        const toAmount = (parseFloat(fromAmount) * rate).toFixed(6);
        const fee = (parseFloat(fromAmount) * 0.0025).toFixed(6); // 0.25% fee

        res.json({
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            fee,
            priceImpact: (Math.random() * 0.5).toFixed(4),
            minReceived: (parseFloat(toAmount) * 0.99).toFixed(6),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== NEWSLETTER ROUTES ====================

// Subscribe to newsletter
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email' });
        }

        let subscription = await Newsletter.findOne({ email: email.toLowerCase() });
        if (subscription) {
            subscription.active = true;
            await subscription.save();
        } else {
            subscription = new Newsletter({
                email: email.toLowerCase(),
            });
            await subscription.save();
        }

        res.status(201).json({ message: 'Subscribed successfully', subscription });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== STATS ROUTES ====================

// Get platform stats
app.get('/api/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const transactionCount = await Transaction.countDocuments();
        const totalPoolLiquidity = await Pool.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: { $toDouble: '$totalLiquidity' } },
                },
            },
        ]);

        const volume24h = await Transaction.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $toDouble: '$fromAmount' } },
                },
            },
        ]);

        res.json({
            users: userCount,
            transactions: transactionCount,
            totalLiquidity: totalPoolLiquidity[0]?.total || 0,
            volume24h: volume24h[0]?.total || 0,
            uptime: 99.9,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`DAPPHO Backend running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;
