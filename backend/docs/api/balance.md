# Balance API

## GET /v1/balance

Returns current authenticated user's KZT balance.

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```json
{
  "amountKzt": 5000,
  "updatedAt": "2026-04-16T16:00:00.000Z"
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/balance"
}
```

### Error Response — 404 Not Found

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Balance not found",
  "errorCode": "BALANCE_NOT_FOUND",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/balance"
}
```