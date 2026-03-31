# DAPPHO Quick Reference Guide

## ðŸš€ 5-Minute Startup

### Terminal 1: MongoDB
```bash
# Start local MongoDB
mongod
```

### Terminal 2: Backend Server
```bash
cd backend
npm install
npm run dev
```

Server runs at: `http://localhost:5000/api`

### Terminal 3: Frontend Server
```bash
cd frontend
python -m http.server 3000
# or: npx http-server -p 3000
```

Open: `http://localhost:3000/dashboard.html`

---

## ðŸ“Œ Most Common API Calls

### 1. Get Wallet Nonce
```javascript
const response = await fetch('http://localhost:5000/api/auth/nonce', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: '0x742d...' })
});
const { nonce } = await response.json();
```

### 2. Sign & Login
```javascript
// Sign with MetaMask
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [`Sign this nonce to login: ${nonce}`, walletAddress]
});

// Verify signature
const res = await fetch('http://localhost:5000/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress, signature })
});
const { token } = await res.json();
localStorage.setItem('authToken', token);
```

### 3. Get Portfolio
```javascript
const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:5000/api/portfolio', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const portfolio = await response.json();
```

### 4. Execute Swap
```javascript
// Get quote
const quote = await fetch('http://localhost:5000/api/swap-quote', {
  method: 'POST',
  body: JSON.stringify({
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '1.0'
  })
}).then(r => r.json());

// Create transaction
await fetch('http://localhost:5000/api/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'swap',
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '1.0',
    toAmount: quote.toAmount,
    fee: quote.fee
  })
}).then(r => r.json());
```

### 5. Get User Profile
```javascript
const profile = await fetch('http://localhost:5000/api/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### 6. Update Profile
```javascript
await fetch('http://localhost:5000/api/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com'
  })
});
```

### 7. Get Transactions
```javascript
const transactions = await fetch('http://localhost:5000/api/transactions', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### 8. Get Liquidity Pools
```javascript
const pools = await fetch('http://localhost:5000/api/pools').then(r => r.json());
```

### 9. Get Platform Stats
```javascript
const stats = await fetch('http://localhost:5000/api/stats').then(r => r.json());
// { users: 145000, transactions: 2500000, totalLiquidity: 2.4B, volume24h: 890M }
```

### 10. Subscribe to Newsletter
```javascript
await fetch('http://localhost:5000/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
```

---

## ðŸ”‘ Authentication Header Template

Always include token in authenticated requests:
```javascript
headers: {
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
}
```

---

## ðŸ’¾ Database Models Quick View

### User
```javascript
{
  walletAddress: String,
  email: String,
  username: String,
  profilePicture: String,
  bio: String,
  createdAt: Date
}
```

### Portfolio
```javascript
{
  walletAddress: String,
  tokens: [{ symbol, address, amount, value, percentage }],
  totalValue: Number,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  walletAddress: String,
  type: 'swap|liquidity_add|liquidity_remove|stake',
  fromToken: String,
  toToken: String,
  fromAmount: String,
  toAmount: String,
  fee: Number,
  status: 'pending|completed|failed',
  txHash: String,
  createdAt: Date
}
```

### Pool
```javascript
{
  poolAddress: String,
  token0: String,
  token1: String,
  reserve0: String,
  reserve1: String,
  totalLiquidity: String,
  fee: Number,
  createdAt: Date
}
```

---

## âš™ï¸ Environment Variables

Create `.env` file in backend folder:
```
MONGODB_URI=mongodb://localhost:27017/dappho
JWT_SECRET=your-secret-key-min-32-chars
INFURA_API_KEY=your_infura_key
PORT=5000
NODE_ENV=development
```

---

## ðŸ§ª Testing Endpoints with cURL

```bash
# Get nonce
curl -X POST http://localhost:5000/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"}'

# Get stats
curl http://localhost:5000/api/stats

# Get pools
curl http://localhost:5000/api/pools

# Get portfolio (with auth)
curl http://localhost:5000/api/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ðŸš¨ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `Cannot connect to MongoDB` | Run `mongod` first |
| `Token is undefined` | Call `/auth/verify` to get token |
| `CORS error` | Backend CORS is configured, check frontend URL |
| `MetaMask not detected` | Install MetaMask extension |
| `Invalid signature` | Sign with same wallet address |
| `Port 5000 in use` | Change PORT in .env or: `kill $(lsof -t -i:5000)` |

---

## ðŸ“ Frontend Integration Template

```html
<script>
  const API = 'http://localhost:5000/api';
  let token = localStorage.getItem('authToken');

  // Helper function
  async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${API}${endpoint}`, options);
    if (response.status === 401) {
      // Handle logout
      token = null;
      localStorage.removeItem('authToken');
    }
    return response.json();
  }

  // Usage examples:
  // await apiCall('/auth/nonce', 'POST', { walletAddress })
  // await apiCall('/portfolio')
  // await apiCall('/swap-quote', 'POST', { fromToken, toToken, fromAmount })
</script>
```

---

## ðŸ”„ Complete Auth Flow

```
1. User clicks "Connect Wallet"
   â†“
2. POST /auth/nonce â†’ Get nonce
   â†“
3. Sign nonce with MetaMask
   â†“
4. POST /auth/verify â†’ Get JWT token
   â†“
5. Save token to localStorage
   â†“
6. Include token in all future requests
```

---

## ðŸ“Š Transaction Types

- **swap**: Token to token exchange
- **liquidity_add**: Add liquidity to pool
- **liquidity_remove**: Remove liquidity from pool
- **stake**: Stake tokens for rewards

---

## ðŸ’¡ Pro Tips

1. **Cache token**: Save JWT in localStorage after login
2. **Error handling**: Always check for 401 status (re-auth)
3. **Loading states**: Show spinner during API calls
4. **Retry logic**: Retry failed requests with exponential backoff
5. **Rate limiting**: Implement client-side rate limiting (1 request/sec)
6. **Polling**: Refresh portfolio/transactions every 30 seconds
7. **Real-time**: Use WebSockets for live price updates (future enhancement)

---

## ðŸš€ Deployment Checklist

- [ ] Update API_BASE_URL to production URL
- [ ] Set NODE_ENV=production
- [ ] Change JWT_SECRET to strong random string
- [ ] Configure MongoDB Atlas connection
- [ ] Set up CORS whitelist
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Test all endpoints in production

---

## ðŸ“š File Structure

```
dappho/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ server.js              â† Main server file
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ .env                   â† Environment config
â”‚   â””â”€â”€ .env.example
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ dashboard.html         â† Trading dashboard
â”‚   â”œâ”€â”€ index.html             â† Landing page
â”‚   â””â”€â”€ dappho-fixed.html      â† Original landing page
â”œâ”€â”€ SETUP_GUIDE.md             â† Detailed setup
â”œâ”€â”€ API_DOCUMENTATION.md       â† Complete API docs
â””â”€â”€ QUICK_REFERENCE.md         â† This file
```

---

## ðŸŽ¯ Next Features to Build

1. **Real-time Price Updates**
   - WebSocket integration
   - Price feed from CoinGecko API

2. **Advanced Trading**
   - Limit orders
   - Stop loss orders
   - DCA (Dollar Cost Averaging)

3. **Smart Contract Integration**
   - Direct blockchain swaps
   - Liquidity pool interactions

4. **Mobile App**
   - React Native version
   - iOS/Android deployment

5. **Analytics Dashboard**
   - Trading history charts
   - Performance metrics
   - Tax reporting

---

## ðŸ“ž Quick Support

**Issue:** Can't connect wallet  
**Fix:** Install MetaMask, refresh page, check network

**Issue:** API returns 401  
**Fix:** Token expired, re-login via /auth/nonce and /auth/verify

**Issue:** Swap fails  
**Fix:** Check sufficient balance, slippage, gas fees

---

**Last Updated:** January 2024  
**Version:** 1.0.0
