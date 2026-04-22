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