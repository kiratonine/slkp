# Bridge Payments API

## GET /v1/bridge/payments

Returns current authenticated user's bridge payment history.

Contains:
- seller URL
- asset
- amount
- estimated KZT debit
- status
- decision
- rejection reason
- Solana transaction signature
- payTo address
- execution timestamps

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```json
{
  "payments": [
    {
      "id": "3a3e36bc-1a7a-4924-8246-66cf544892ff",
      "sellerUrl": "http://localhost:3002/paid/sol",
      "purpose": "premium sol quote",
      "amountAtomic": "0.001",
      "asset": "SOL",
      "network": "solana",
      "estimatedKztDebit": 75,
      "status": "SUCCEEDED",
      "decision": "APPROVED",
      "rejectionReason": null,
      "paymentResponseB64": "eyJ4NDAyVmVyc2lvbiI6Mn0=",
      "solanaTxSignature": "zXRkWtz5Lemtf6NFpyecoCAn1uv3eY2rmBDjB3QVG9TktnCnRtKQJgkd3y52x4NWcrTaCd376PBETXQiAcE3dAs",
      "payToAddress": "5XQBzPw28iMB52PdB8TYc2k2SoeM1wyH11kgjcgfNuod",
      "executedAt": "2026-04-22T11:49:46.065Z",
      "createdAt": "2026-04-22T11:49:42.859Z"
    }
  ]
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/bridge/payments"
}
```

## GET /v1/bridge/payments/:id

Returns one bridge payment that belongs to the authenticated user.

### Headers

```http
Authorization: Bearer <token>
```

### Params

```text
id: bridge payment id
```

### Success Response

```json
{
  "payment": {
    "id": "uuid",
    "sellerUrl": "http://localhost:3002/paid/sol",
    "purpose": "premium sol quote",
    "amountAtomic": "0.001",
    "asset": "SOL",
    "network": "solana",
    "estimatedKztDebit": 75,
    "status": "SUCCEEDED",
    "decision": "APPROVED",
    "rejectionReason": null,
    "paymentResponseB64": "eyJ4NDAyVmVyc2lvbiI6Mn0=",
    "solanaTxSignature": "5abc...",
    "payToAddress": "sellerPublicKey",
    "executedAt": "2026-04-22T12:00:00.000Z",
    "createdAt": "2026-04-22T12:00:00.000Z"
  }
}
```

### Error Response — 404 Not Found

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Bridge payment not found",
  "errorCode": "BRIDGE_PAYMENT_NOT_FOUND",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/bridge/payments/:id"
}
```

## POST /v1/bridge/payments/:id/confirm

Finalizes bridge payment after seller successfully accepts `PAYMENT-SIGNATURE`.

This endpoint is called by agent SDK after seller returns successful paid response.

It:
- verifies agent session token
- checks payment ownership
- debits KZT balance
- creates ledger entry
- marks payment as `SUCCEEDED`
- stores optional x402 `PAYMENT-RESPONSE`

### Headers

```http
Content-Type: application/json
```

### Params

```text
id: bridge payment id
```

### Request Body

```json
{
  "sessionToken": "eyJ...",
  "paymentResponseB64": "eyJ4NDAyVmVyc2lvbiI6Mn0="
}
```

### Success Response

```json
{
  "status": "confirmed",
  "paymentId": "uuid",
  "ledgerEntryId": "uuid",
  "estimatedKztDebit": 5
}
```

### Error Response — 400 Bad Request

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Bridge payment is not approved",
  "errorCode": "BRIDGE_PAYMENT_NOT_APPROVED",
  "timestamp": "2026-04-25T20:40:00.000Z",
  "path": "/v1/bridge/payments/uuid/confirm"
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid agent session token",
  "errorCode": "AGENT_SESSION_INVALID",
  "timestamp": "2026-04-25T20:40:00.000Z",
  "path": "/v1/bridge/payments/uuid/confirm"
}
```

### Error Response — 404 Not Found

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Bridge payment not found",
  "errorCode": "BRIDGE_PAYMENT_NOT_FOUND",
  "timestamp": "2026-04-25T20:40:00.000Z",
  "path": "/v1/bridge/payments/uuid/confirm"
}
```

