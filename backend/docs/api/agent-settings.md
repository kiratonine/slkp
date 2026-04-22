# Agent Settings API

## GET /v1/settings/agent-payments

Returns current authenticated user's agent payment settings.

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```json
{
  "isEnabled": false,
  "dailyLimitKzt": 0,
  "perTransactionLimitKzt": 0,
  "requireConfirmNewSeller": true,
  "updatedAt": "2026-04-16T16:00:00.000Z"
}
```

### Error Response — 401 Unauthorized

## PUT /v1/settings/agent-payments

Updates current authenticated user's agent payment settings.

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```Json
{
  "isEnabled": true,
  "dailyLimitKzt": 3000,
  "perTransactionLimitKzt": 500,
  "requireConfirmNewSeller": true
}
```

### Success Response

```Json
{
  "isEnabled": true,
  "dailyLimitKzt": 3000,
  "perTransactionLimitKzt": 500,
  "requireConfirmNewSeller": true,
  "updatedAt": "2026-04-16T16:10:00.000Z"
}
```

### Error Response — 400 Bad Request
### Error Response — 401 Unauthorized