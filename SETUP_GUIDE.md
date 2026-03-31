# DAPPHO Full-Stack DeFi Platform - Setup Guide

## 📋 Project Structure

```
dappho/
├── backend/
│   ├── server.js              # Express.js backend server
│   ├── package.json           # Node.js dependencies
│   ├── .env.example           # Environment variables template
│   ├── models/
│   │   ├── User.js
│   │   ├── Portfolio.js
│   │   ├── Transaction.js
│   │   └── Pool.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── portfolio.js
│       └── transactions.js
├── frontend/
│   ├── dashboard.html         # Main trading dashboard
│   ├── index.html             # Landing page
│   └── assets/
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ and npm
- MongoDB (local or Atlas)
- MetaMask or compatible Web3 wallet
- Ethereum testnet account (Sepolia recommended)

### 1. Backend Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Configure Environment
```bash
# Copy example env
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required ENV Variables:**
```
MONGODB_URI=mongodb://localhost:27017/dappho
JWT_SECRET=your-super-secret-key-min-32-chars
INFURA_API_KEY=your_infura_api_key
PORT=5000
```

#### Step 3: Start the Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Server will be available at: `http://localhost:5000`

### 2. Frontend Setup

#### Step 1: Update API URL
Edit the API_BASE_URL in your HTML files:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

#### Step 2: Serve Frontend
You can serve the HTML files using:
```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx http-server -p 3000

# Using VS Code Live Server extension
# Right-click on HTML file → Open with Live Server
```

#### Step 3: Access Dashboard
Open in browser: `http://localhost:3000/dashboard.html`

## 🔐 Authentication Flow

### Wallet Sign-In Process

1. **Request Nonce:**
   ```javascript
   POST /api/auth/nonce
   Body: { walletAddress: "0x..." }
   Response: { nonce: "123456", message: "Sign this..." }
   ```

2. **Sign Message:**
   Uses MetaMask's `personal_sign` to sign the nonce

3. **Verify Signature:**
   ```javascript
   POST /api/auth/verify
   Body: { walletAddress: "0x...", signature: "0x..." }
   Response: { token: "jwt_token", user: {...} }
   ```

4. **Authenticated Requests:**
   Include JWT in Authorization header:
   ```javascript
   Authorization: Bearer {jwt_token}
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/nonce` - Get nonce for signing
- `POST /api/auth/verify` - Verify signature and get JWT

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Portfolio
- `GET /api/portfolio` - Get user's portfolio
- `POST /api/portfolio/update` - Update portfolio

### Transactions
- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions` - Create new transaction
- `PATCH /api/transactions/:id` - Update transaction status

### Swaps
- `POST /api/swap-quote` - Get swap quote

### Liquidity Pools
- `GET /api/pools` - Get all pools
- `GET /api/pools/:id` - Get specific pool

### Statistics
- `GET /api/stats` - Get platform statistics

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

## 🗄️ Database Models

### User Schema
```javascript
{
  walletAddress: String (unique),
  email: String (unique),
  username: String,
  profilePicture: String,
  bio: String,
  nonce: String,
  createdAt: Date
}
```

### Portfolio Schema
```javascript
{
  userId: ObjectId,
  walletAddress: String,
  tokens: [{
    symbol: String,
    address: String,
    amount: String,
    value: Number,
    percentage: Number
  }],
  totalValue: Number,
  updatedAt: Date
}
```

### Transaction Schema
```javascript
{
  userId: ObjectId,
  walletAddress: String,
  type: String (swap|liquidity_add|liquidity_remove|stake),
  fromToken: String,
  toToken: String,
  fromAmount: String,
  toAmount: String,
  fee: Number,
  gasUsed: String,
  txHash: String,
  status: String (pending|completed|failed),
  createdAt: Date,
  completedAt: Date
}
```

## 🔗 MongoDB Connection

### Local MongoDB
```javascript
MONGODB_URI=mongodb://localhost:27017/dappho
```

### MongoDB Atlas (Cloud)
```javascript
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dappho?retryWrites=true&w=majority
```

**Steps to set up Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Generate connection string
5. Replace `<username>` and `<password>`
6. Whitelist your IP address

## 🌐 Ethereum Network Setup

### Supported Networks
- Ethereum Mainnet (production)
- Sepolia Testnet (testing)
- Polygon
- Arbitrum
- Optimism

### Infura Setup (for RPC calls)
1. Go to https://infura.io
2. Create account
3. Create project
4. Copy API key
5. Add to .env: `INFURA_API_KEY=your_key`

## 🧪 Testing

### Test Wallet Sign-In
```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x..."}'
```

### Test API Endpoints
```javascript
// In browser console
const API = 'http://localhost:5000/api';

// Get stats
fetch(`${API}/stats`)
  .then(r => r.json())
  .then(d => console.log(d))
```

## 🚢 Deployment

### Deploy Backend (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create dappho-backend

# Add environment variables
heroku config:set MONGODB_URI=your_atlas_url
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Deploy Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy Frontend (GitHub Pages)
```bash
# Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .

# Add your HTML files and commit
git add .
git commit -m "Deploy"
git push origin gh-pages

# Set GitHub Pages source to gh-pages branch
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit .env file
   - Use strong JWT_SECRET (32+ characters)
   - Rotate secrets regularly

2. **CORS Configuration**
   - Whitelist trusted domains
   - Restrict API access

3. **Input Validation**
   - Validate all user inputs
   - Sanitize database queries

4. **Smart Contracts**
   - Get security audits
   - Use OpenZeppelin libraries
   - Test extensively

5. **Rate Limiting**
   - Implement rate limiting on API
   - Prevent brute force attacks

```javascript
// Add to server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED
Solution: Ensure MongoDB is running (mongod command)
```

### CORS Errors
```
Error: Access to XMLHttpRequest blocked by CORS
Solution: Check backend CORS configuration
```

### MetaMask Not Detected
```
Error: MetaMask not detected
Solution: Install MetaMask extension, refresh page
```

### Invalid Signature
```
Error: Invalid signature
Solution: Check wallet address matches, sign with same account
```

## 📈 Next Steps

1. **Add Smart Contracts**
   - Deploy Uniswap-like DEX contracts
   - Implement token swapping logic

2. **Real-Time Updates**
   - Add WebSocket support
   - Implement price feeds

3. **Advanced Features**
   - Limit orders
   - Stop loss
   - Advanced charting

4. **Mobile App**
   - React Native/Flutter app
   - Mobile wallet integration

## 📖 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Guide](https://docs.mongodb.com/)
- [Web3.js](https://web3js.readthedocs.io/)
- [Ethers.js](https://docs.ethers.org/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API endpoints documentation
3. Check browser console for errors
4. Review server logs

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** 2024
**Version:** 1.0.0
