# Bridge API

## POST /v1/bridge/pay

Processes AI agent payment request through S1lk x402 Bridge.

At this stage endpoint validates:
- session token
- revoke status
- expiration
- idempotency

### Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "sessionToken": "eyJ...",
  "sellerUrl": "https://seller.dev/paid/usdc",
  "paymentRequiredB64": "eyJ4NDAyVmVyc2lvbiI6Mn0=",
  "idempotencyKey": "demo-key-001",
  "purpose": "premium fx quote"
}
```

### Example Response

```Json
{
  "status": "rejected",
  "paymentId": "uuid",
  "reason": "Bridge payment execution is not implemented yet"
}
```