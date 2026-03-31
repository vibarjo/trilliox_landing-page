# DAPPHO API Documentation

**Base URL:** `http://localhost:5000/api`  
**Version:** 1.0.0

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Portfolio](#portfolio)
4. [Transactions](#transactions)
5. [Swaps](#swaps)
6. [Liquidity Pools](#liquidity-pools)
7. [Statistics](#statistics)
8. [Newsletter](#newsletter)
9. [Error Handling](#error-handling)

---

## Authentication

### Get Nonce for Signing
Request a nonce for wallet authentication.

**Endpoint:** `POST /auth/nonce`

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
}
```

**Response (200):**
```json
{
  "nonce": "123456",
  "message": "Sign this nonce to login: 123456"
}
```

**Error (400):**
```json
{
  "error": "Invalid wallet address"
}
```

---

### Verify Signature and Login
Verify the signed message and receive JWT token.

**Endpoint:** `POST /auth/verify`

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "signature": "0x1234...abcd"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
    "email": null,
    "username": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid signature"
}
```

---

## Users

### Get User Profile
Get authenticated user's profile information.

**Endpoint:** `GET /users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
  "email": "user@example.com",
  "username": "john_doe",
  "profilePicture": "https://example.com/avatar.jpg",
  "bio": "DeFi trader and liquidity provider",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error (401):**
```json
{
  "error": "No token provided"
}
```

---

### Update User Profile
Update user profile information.

**Endpoint:** `PUT /users/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "username": "john_trader",
  "email": "john@example.com",
  "bio": "Professional DeFi trader",
  "profilePicture": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
  "email": "john@example.com",
  "username": "john_trader",
  "profilePicture": "https://example.com/new-avatar.jpg",
  "bio": "Professional DeFi trader",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## Portfolio

### Get Portfolio
Get user's current portfolio and asset holdings.

**Endpoint:** `GET /portfolio`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
  "tokens": [
    {
      "symbol": "ETH",
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "amount": "5.5",
      "value": 11000,
      "percentage": 55.0
    },
    {
      "symbol": "USDC",
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "amount": "9000",
      "value": 9000,
      "percentage": 45.0
    }
  ],
  "totalValue": 20000,
  "updatedAt": "2024-01-15T15:30:00Z"
}
```

---

### Update Portfolio
Update user's portfolio holdings (typically called after a transaction).

**Endpoint:** `POST /portfolio/update`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "tokens": [
    {
      "symbol": "ETH",
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "amount": "6.0",
      "value": 12000,
      "percentage": 60.0
    },
    {
      "symbol": "USDC",
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "amount": "8000",
      "value": 8000,
      "percentage": 40.0
    }
  ],
  "totalValue": 20000
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
  "tokens": [...],
  "totalValue": 20000,
  "updatedAt": "2024-01-15T16:00:00Z"
}
```

---

## Transactions

### Get Transactions
Get user's transaction history.

**Endpoint:** `GET /transactions`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
    "type": "swap",
    "fromToken": "ETH",
    "toToken": "USDC",
    "fromAmount": "1.0",
    "toAmount": "2000",
    "fee": "5",
    "gasUsed": "200000",
    "txHash": "0x1234...abcd",
    "status": "completed",
    "createdAt": "2024-01-15T14:00:00Z",
    "completedAt": "2024-01-15T14:05:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "type": "liquidity_add",
    "fromToken": "ETH",
    "toToken": "USDC",
    "fromAmount": "5.0",
    "toAmount": "10000",
    "fee": "25",
    "status": "pending",
    "createdAt": "2024-01-15T13:00:00Z"
  }
]
```

---

### Create Transaction
Create a new transaction record.

**Endpoint:** `POST /transactions`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "type": "swap",
  "fromToken": "ETH",
  "toToken": "USDC",
  "fromAmount": "2.5",
  "toAmount": "5000",
  "fee": "12.50"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
  "type": "swap",
  "fromToken": "ETH",
  "toToken": "USDC",
  "fromAmount": "2.5",
  "toAmount": "5000",
  "fee": "12.50",
  "status": "pending",
  "createdAt": "2024-01-15T16:15:00Z"
}
```

---

### Update Transaction Status
Update transaction status and add blockchain details.

**Endpoint:** `PATCH /transactions/:id`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "completed",
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "gasUsed": "200000"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
  "type": "swap",
  "fromToken": "ETH",
  "toToken": "USDC",
  "fromAmount": "2.5",
  "toAmount": "5000",
  "fee": "12.50",
  "gasUsed": "200000",
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "status": "completed",
  "createdAt": "2024-01-15T16:15:00Z",
  "completedAt": "2024-01-15T16:20:00Z"
}
```

---

## Swaps

### Get Swap Quote
Get a price quote for a swap without executing it.

**Endpoint:** `POST /swap-quote`

**Headers:**
```
Content-Type: application/json
```

**Request:**
```json
{
  "fromToken": "ETH",
  "toToken": "USDC",
  "fromAmount": "1.5"
}
```

**Response (200):**
```json
{
  "fromToken": "ETH",
  "toToken": "USDC",
  "fromAmount": "1.5",
  "toAmount": "3000.50",
  "fee": "7.50",
  "priceImpact": "0.25",
  "minReceived": "2970.50"
}
```

**Field Explanations:**
- `toAmount`: Exact amount you'll receive
- `fee`: Transaction fee (0.25% default)
- `priceImpact`: Impact on the price due to trade size
- `minReceived`: Minimum amount after slippage (default 1%)

---

## Liquidity Pools

### Get All Pools
Get list of all liquidity pools.

**Endpoint:** `GET /pools`

**Query Parameters:**
- `sort` (optional): Sort by field (default: totalLiquidity)
- `limit` (optional): Number of pools to return

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "poolAddress": "0x1234567890123456789012345678901234567890",
    "token0": "ETH",
    "token1": "USDC",
    "reserve0": "1000",
    "reserve1": "2000000",
    "totalLiquidity": "1414213",
    "fee": 0.25,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T16:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "poolAddress": "0x0987654321098765432109876543210987654321",
    "token0": "USDC",
    "token1": "DAI",
    "reserve0": "5000000",
    "reserve1": "5000000",
    "totalLiquidity": "5000000",
    "fee": 0.01,
    "createdAt": "2024-01-02T00:00:00Z",
    "updatedAt": "2024-01-15T16:30:00Z"
  }
]
```

---

### Get Pool Details
Get detailed information about a specific pool.

**Endpoint:** `GET /pools/:id`

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "poolAddress": "0x1234567890123456789012345678901234567890",
  "token0": "ETH",
  "token1": "USDC",
  "reserve0": "1000",
  "reserve1": "2000000",
  "totalLiquidity": "1414213",
  "fee": 0.25,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T16:30:00Z"
}
```

---

## Statistics

### Get Platform Statistics
Get overall platform metrics and statistics.

**Endpoint:** `GET /stats`

**Response (200):**
```json
{
  "users": 145000,
  "transactions": 2500000,
  "totalLiquidity": 2400000000,
  "volume24h": 890000000,
  "uptime": 99.9
}
```

**Field Explanations:**
- `users`: Total active users
- `transactions`: Total transactions processed
- `totalLiquidity`: Total value locked (TVL) in pools
- `volume24h`: Trading volume in last 24 hours
- `uptime`: Platform uptime percentage

---

## Newsletter

### Subscribe to Newsletter
Subscribe email to newsletter mailing list.

**Endpoint:** `POST /newsletter/subscribe`

**Headers:**
```
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "message": "Subscribed successfully",
  "subscription": {
    "_id": "507f1f77bcf86cd799439030",
    "email": "user@example.com",
    "subscribedAt": "2024-01-15T16:45:00Z",
    "active": true
  }
}
```

**Error (400):**
```json
{
  "error": "Invalid email"
}
```

---

## Error Handling

### Error Response Format
All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid wallet address, missing fields |
| 401 | Unauthorized | Invalid token, not authenticated |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error, server issue |

### Common Error Messages

```json
{
  "error": "Invalid wallet address"
}
```

```json
{
  "error": "No token provided"
}
```

```json
{
  "error": "Invalid token"
}
```

```json
{
  "error": "User not found"
}
```

```json
{
  "error": "Invalid signature"
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes
- **Header:** `X-RateLimit-Remaining`
- **Error:** 429 Too Many Requests

---

## CORS Configuration

The API supports CORS. Include these headers in requests:

```
Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

---

## Pagination

For endpoints that return lists, use:
- `limit`: Number of items (default: 50, max: 100)
- `offset`: Skip n items (default: 0)

Example:
```
GET /transactions?limit=20&offset=40
```

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-01-15T16:45:00Z
```

---

## Version History

### v1.0.0 (2024-01-15)
- Initial release
- Core endpoints: Auth, Users, Portfolio, Transactions, Swaps, Pools
- Real-time statistics

---

## Examples

### Complete Swap Flow

```javascript
// 1. Get nonce
const nonceRes = await fetch('http://localhost:5000/api/auth/nonce', {
  method: 'POST',
  body: JSON.stringify({ walletAddress: userAddress })
});
const { nonce } = await nonceRes.json();

// 2. Sign with MetaMask
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [`Sign this nonce to login: ${nonce}`, userAddress]
});

// 3. Verify and get token
const verifyRes = await fetch('http://localhost:5000/api/auth/verify', {
  method: 'POST',
  body: JSON.stringify({ walletAddress: userAddress, signature })
});
const { token } = await verifyRes.json();

// 4. Get swap quote
const quoteRes = await fetch('http://localhost:5000/api/swap-quote', {
  method: 'POST',
  body: JSON.stringify({
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '1.5'
  })
});
const quote = await quoteRes.json();

// 5. Create transaction
const txRes = await fetch('http://localhost:5000/api/transactions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    type: 'swap',
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '1.5',
    toAmount: quote.toAmount,
    fee: quote.fee
  })
});
const transaction = await txRes.json();

// 6. Execute actual swap on blockchain
// (Implementation depends on your smart contracts)

// 7. Update transaction status
const updateRes = await fetch(
  `http://localhost:5000/api/transactions/${transaction._id}`,
  {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      status: 'completed',
      txHash: blockchainTxHash,
      gasUsed: gasUsed
    })
  }
);
```

---

## Support

For API support and issues, please:
1. Check this documentation
2. Review error messages carefully
3. Check the server logs
4. Contact support team
