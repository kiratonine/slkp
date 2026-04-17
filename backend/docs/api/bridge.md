# Bridge API

## POST /v1/bridge/pay

Processes AI agent payment request through S1lk x402 Bridge.

At this stage endpoint validates:
- session token
- revoke status
- expiration
- idempotency
- payment payload format
- enabled agent payments
- per transaction limit
- current user balance

### Headers

Content-Type: application/json

### Request Body

```json
{
  "sessionToken": "eyJ...",
  "sellerUrl": "https://seller.dev/paid/usdc",
  "paymentRequiredB64": "BASE64_STRING_HERE",
  "idempotencyKey": "demo-key-001",
  "purpose": "premium fx quote"
}
```

### Example Success Response

```json
{
  "status": "ok",
  "paymentId": "uuid",
  "paymentSignatureB64": "base64-mock-signature",
  "asset": "USDC",
  "amountAtomic": "0.1",
  "network": "solana",
  "estimatedKztDebit": 50
}
```

### Example Rejected Response

```json
{
  "status": "rejected",
  "paymentId": "uuid",
  "reason": "Per transaction limit exceeded"
}
```