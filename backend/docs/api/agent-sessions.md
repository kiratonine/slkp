# Agent Sessions API

## POST /v1/agent-sessions

Creates a new agent session and returns session token.

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Main CLI Agent",
  "expiresInDays": 7
}
```

### Success Response

```Json
{
  "session": {
    "id": "uuid",
    "name": "Main CLI Agent",
    "status": "ACTIVE",
    "expiresAt": "2026-04-24T12:00:00.000Z",
    "revokedAt": null,
    "createdAt": "2026-04-17T12:00:00.000Z"
  },
  "sessionToken": "eyJ..."
}
```

## GET /v1/agent-sessions

Returns current authenticated user's agent sessions.

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```Json
{
  "sessions": [
    {
      "id": "uuid",
      "name": "Main CLI Agent",
      "status": "ACTIVE",
      "expiresAt": "2026-04-24T12:00:00.000Z",
      "revokedAt": null,
      "createdAt": "2026-04-17T12:00:00.000Z"
    }
  ]
}
```

## POST /v1/agent-sessions/:id/revoke

Revokes agent session.

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```Json
{
  "session": {
    "id": "uuid",
    "name": "Main CLI Agent",
    "status": "REVOKED",
    "expiresAt": "2026-04-24T12:00:00.000Z",
    "revokedAt": "2026-04-17T12:10:00.000Z",
    "createdAt": "2026-04-17T12:00:00.000Z"
  }
}
```