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