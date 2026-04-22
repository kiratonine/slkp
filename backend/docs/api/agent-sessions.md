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

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/agent-sessions"
}
```

### Error Response — 400 Bad Request

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/agent-sessions"
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

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/agent-sessions"
}
```

## GET /v1/agent-sessions/:id

Returns one agent session that belongs to the authenticated user.

### Headers

```http
Authorization: Bearer <token>
```

### Params

```text
id: agent session id
```

### Success Response

```json
{
  "session": {
    "id": "uuid",
    "name": "Main CLI Agent",
    "status": "ACTIVE",
    "expiresAt": "2026-04-24T12:00:00.000Z",
    "revokedAt": null,
    "createdAt": "2026-04-17T12:00:00.000Z"
  }
}
```

### Error Response — 404 Not Found

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Agent session not found",
  "errorCode": "AGENT_SESSION_NOT_FOUND",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/agent-sessions/:id"
}
```

## POST /v1/agent-sessions/:id/revoke

Revokes agent session.

### Headers

```http
Authorization: Bearer <token>
```

### Params

```text
id: agent session id
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

### Error Response — 404 Not Found

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Agent session not found",
  "errorCode": "AGENT_SESSION_NOT_FOUND",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/agent-sessions/:id/revoke"
}
```

### Error Response — 401 Unauthorized

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "timestamp": "2026-04-23T10:00:00.000Z",
  "path": "/v1/agent-sessions/:id/revoke"
}
```