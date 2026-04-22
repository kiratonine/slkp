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

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/settings/agent-payments"
}
```

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

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/settings/agent-payments"
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/settings/agent-payments"
}
```