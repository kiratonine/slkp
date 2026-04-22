# Ledger API

## GET /v1/ledger

Returns current authenticated user's ledger history.

Contains:
- payment reference
- KZT amount
- entry type
- creation timestamp

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```json
{
  "entries": [
    {
      "id": "4c810c07-3bd9-4527-a80b-1aff33708464",
      "paymentId": "3a3e36bc-1a7a-4924-8246-66cf544892ff",
      "amountKzt": -75,
      "type": "DEBIT",
      "createdAt": "2026-04-22T11:49:46.400Z"
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
  "path": "/v1/ledger"
}
```