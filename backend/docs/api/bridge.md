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

At this stage endpoint does not finalize KZT debit immediately.

It:
- validates session token
- validates payment requirements
- validates limits and balance
- creates canonical x402 `PAYMENT-SIGNATURE`
- stores bridge payment as `PENDING`
- returns payment signature to agent

Final KZT debit and ledger entry are created only after seller successfully accepts payment and agent calls:

`POST /v1/bridge/payments/:id/confirm`

### Headers

```http
Content-Type: application/json
```

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
  "paymentSignatureB64": "base64-x402-payment-signature",
  "asset": "USDC",
  "amountAtomic": "10000",
  "network": "solana",
  "estimatedKztDebit": 5
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

### Error Response — 400 Bad Request

```json
{
  "status": "rejected",
  "reason": "Malformed PAYMENT-REQUIRED payload"
}
```

### Error Response — 403 Forbidden

```json
{
  "status": "rejected",
  "reason": "Agent payments are disabled"
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired session token",
  "errorCode": "AGENT_SESSION_INVALID",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/bridge/pay"
}
```

### Error Response — 409 Conflict

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Idempotency key conflict",
  "errorCode": "IDEMPOTENCY_CONFLICT",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/bridge/pay"
}
```

### Important

`POST /v1/bridge/pay` only prepares payment and returns `PAYMENT-SIGNATURE`.

It does not create ledger entry yet.

Payment is finalized only after seller returns successful response and SDK calls confirm endpoint.