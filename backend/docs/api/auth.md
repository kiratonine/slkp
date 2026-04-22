# Auth API

## POST /v1/auth/register

Registers a new user in the S1lk x402 Bridge system.

After successful registration, backend creates:
- user account
- initial KZT balance
- default agent payment settings

### Headers

```http
Content-Type: application/json
```

### Request Body

```Json
{
  "email": "denis@example.com",
  "password": "StrongPass123"
}
```

### Success Response — 201 Created

```Json
{
  "user": {
    "id": "uuid",
    "email": "denis@example.com",
    "createdAt": "2026-04-16T16:00:00.000Z"
  },
  "balance": {
    "amountKzt": 5000,
    "updatedAt": "2026-04-16T16:00:00.000Z"
  },
  "agentSettings": {
    "isEnabled": false,
    "dailyLimitKzt": 0,
    "perTransactionLimitKzt": 0,
    "requireConfirmNewSeller": true,
    "updatedAt": "2026-04-16T16:00:00.000Z"
  }
}
```

### Error Response — 400 Bad Request

```Json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Email already exists",
  "errorCode": "AUTH_EMAIL_ALREADY_EXISTS",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/auth/register"
}
```

### Error Response — 400 Validation Error

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "email must be an email",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/auth/register"
}
```

## POST /v1/auth/login

Authenticates existing user and returns JWT access token.

### Headers

```http
Content-Type: application/json
```

### Request Body

```Json
{
  "email": "denis@example.com",
  "password": "StrongPass123"
}
```

### Success Response — 200 OK

```Json
{
  "accessToken": "jwt-token-here",
  "tokenType": "Bearer",
  "expiresIn": "7d",
  "user": {
    "id": "uuid",
    "email": "denis@example.com",
    "createdAt": "2026-04-16T16:00:00.000Z"
  }
}
```

### Error Response — 400 Bad Request

```Json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/auth/login"
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "errorCode": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/auth/login"
}
```
