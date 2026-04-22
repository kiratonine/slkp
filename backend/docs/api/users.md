# Users API

## GET /v1/users/me

Returns current authenticated user.

### Headers

```http
Authorization: Bearer <token>
```

### Success Response - 200 OK

```Json
{
  "id": "uuid",
  "email": "denis@example.com",
  "createdAt": "..."
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/users/me"
}
```