# Chat Service Proxy API Documentation

This document describes the chat service proxy endpoints available through the AJWADI Backend API.

## Overview

The AJWADI Backend acts as a proxy to an external chat service, forwarding requests and handling authentication. All chat-related endpoints are prefixed with `/api/chat`.

**Base URL**: `http://localhost:5000/api/chat` (development)

## Authentication

### Public Endpoints
- **Health Check**: No authentication required

### User Endpoints
- **All other endpoints**: Require JWT Bearer token
- Include in request header: `Authorization: Bearer <your-jwt-token>`

### Internal Endpoints
- **User Sync endpoints**: Use `X-Internal-Secret` header (handled automatically by backend)

## Error Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Endpoints

### Health

#### GET /api/chat/health

Check chat service health status.

**Authentication**: None required

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:5000/api/chat/health
```

---

### Users (Internal)

These endpoints are used internally by the backend to sync users with the chat service. They are automatically called when users are created or updated.

#### POST /api/chat/users/sync

Sync a single user profile to the chat service.

**Authentication**: Internal (uses `X-Internal-Secret`)

**Request Body**:
```json
{
  "externalUserId": "user_123",
  "displayName": "Jane Doe",
  "avatarUrl": "https://example.com/avatar.png",
  "metadata": {
    "phone": "+1234567890",
    "mode": "freelancer",
    "country": "US"
  }
}
```

**Response**: `200 OK`

**Note**: This endpoint is called automatically by the backend on user create/update. Manual calls are not typically needed.

---

#### POST /api/chat/users/sync/batch

Sync multiple users in a single request (more efficient for bulk operations).

**Authentication**: Internal (uses `X-Internal-Secret`)

**Request Body**:
```json
{
  "users": [
    {
      "externalUserId": "user_1",
      "displayName": "User One",
      "avatarUrl": "https://example.com/avatar1.png",
      "metadata": {}
    },
    {
      "externalUserId": "user_2",
      "displayName": "User Two",
      "avatarUrl": null,
      "metadata": {}
    }
  ]
}
```

**Response**: `200 OK`

**Note**: Use the sync command for bulk operations: `npm run chat:sync`

---

#### GET /api/chat/users/:externalUserId

Get user information from chat service.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `externalUserId` (string, required): The user ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/users/user_123 \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### DELETE /api/chat/users/:externalUserId

Delete a user from the chat service.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `externalUserId` (string, required): The user ID

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/chat/users/user_123 \
  -H "Authorization: Bearer <jwt-token>"
```

---

### Conversations

#### POST /api/chat/conversations

Create a new conversation (direct or group).

**Authentication**: JWT Bearer token required

**Request Body**:
```json
{
  "type": "direct",
  "participantIds": ["user_1", "user_2"]
}
```

**Response**: `201 Created`
```json
{
  "id": "conv_123",
  "type": "direct",
  "participants": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "direct",
    "participantIds": ["user_1", "user_2"]
  }'
```

---

#### GET /api/chat/conversations

List conversations for the authenticated user.

**Authentication**: JWT Bearer token required

**Query Parameters**:
- `limit` (number, optional): Number of results to return
- `cursor` (string, optional): Pagination cursor
- `type` (string, optional): Filter by conversation type (`direct` or `group`)

**Example**:
```bash
curl -X GET "http://localhost:5000/api/chat/conversations?limit=20&type=direct" \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### GET /api/chat/conversations/:id

Get conversation details.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Conversation ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/conversations/conv_123 \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### DELETE /api/chat/conversations/:id

Delete or leave a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Conversation ID

**Query Parameters**:
- `mode` (string, optional): `leave` or `delete` (default: `leave`)

**Example**:
```bash
curl -X DELETE "http://localhost:5000/api/chat/conversations/conv_123?mode=leave" \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### POST /api/chat/conversations/:id/participants

Add a participant to a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Conversation ID

**Request Body**:
```json
{
  "externalUserId": "user_3",
  "role": "member"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/chat/conversations/conv_123/participants \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "externalUserId": "user_3",
    "role": "member"
  }'
```

---

#### PATCH /api/chat/conversations/:id/participants/:userId

Update a participant's role in a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Conversation ID
- `userId` (string, required): User ID

**Request Body**:
```json
{
  "role": "admin"
}
```

**Example**:
```bash
curl -X PATCH http://localhost:5000/api/chat/conversations/conv_123/participants/user_3 \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

---

#### DELETE /api/chat/conversations/:id/participants/:userId

Remove a participant from a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Conversation ID
- `userId` (string, required): User ID

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/chat/conversations/conv_123/participants/user_3 \
  -H "Authorization: Bearer <jwt-token>"
```

---

### Messages

#### POST /api/chat/conversations/:conversationId/messages

Send a message in a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `conversationId` (string, required): Conversation ID

**Request Body**:
```json
{
  "content": "Hello, how are you?",
  "attachments": [
    {
      "externalFileId": "file_123",
      "type": "image",
      "url": "https://example.com/file.jpg"
    }
  ]
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/chat/conversations/conv_123/messages \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello!",
    "attachments": []
  }'
```

---

#### GET /api/chat/conversations/:conversationId/messages

Get messages from a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `conversationId` (string, required): Conversation ID

**Query Parameters**:
- `limit` (number, optional): Number of messages to return
- `before` (string, optional): Get messages before this message ID
- `after` (string, optional): Get messages after this message ID
- `includeDeleted` (boolean, optional): Include deleted messages

**Example**:
```bash
curl -X GET "http://localhost:5000/api/chat/conversations/conv_123/messages?limit=50&after=msg_456" \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### GET /api/chat/messages/:id

Get a specific message by ID.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Message ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/messages/msg_123 \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### PATCH /api/chat/messages/:id

Edit a message.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Message ID

**Request Body**:
```json
{
  "content": "Edited message content"
}
```

**Example**:
```bash
curl -X PATCH http://localhost:5000/api/chat/messages/msg_123 \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated message"
  }'
```

---

#### DELETE /api/chat/messages/:id

Delete a message.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `id` (string, required): Message ID

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/chat/messages/msg_123 \
  -H "Authorization: Bearer <jwt-token>"
```

---

### Reactions

#### POST /api/chat/messages/:messageId/reactions

Add a reaction to a message.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `messageId` (string, required): Message ID

**Request Body**:
```json
{
  "emoji": "👍"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/chat/messages/msg_123/reactions \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emoji": "👍"
  }'
```

---

#### DELETE /api/chat/messages/:messageId/reactions/:emoji

Remove a reaction from a message.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `messageId` (string, required): Message ID
- `emoji` (string, required): Emoji to remove

**Example**:
```bash
curl -X DELETE http://localhost:5000/api/chat/messages/msg_123/reactions/%F0%9F%91%8D \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### GET /api/chat/messages/:messageId/reactions

Get all reactions for a message.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `messageId` (string, required): Message ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/messages/msg_123/reactions \
  -H "Authorization: Bearer <jwt-token>"
```

---

### Read Receipts

#### PUT /api/chat/messages/:messageId/read

Mark a message as read.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `messageId` (string, required): Message ID

**Example**:
```bash
curl -X PUT http://localhost:5000/api/chat/messages/msg_123/read \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### PUT /api/chat/conversations/:conversationId/read

Mark all messages up to a certain point as read in a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `conversationId` (string, required): Conversation ID

**Request Body**:
```json
{
  "upToMessageId": "msg_456"
}
```

**Example**:
```bash
curl -X PUT http://localhost:5000/api/chat/conversations/conv_123/read \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "upToMessageId": "msg_456"
  }'
```

---

#### GET /api/chat/messages/:messageId/read

Get read receipt information for a message.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `messageId` (string, required): Message ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/messages/msg_123/read \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### GET /api/chat/conversations/:conversationId/unread-count

Get unread message count for a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `conversationId` (string, required): Conversation ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/conversations/conv_123/unread-count \
  -H "Authorization: Bearer <jwt-token>"
```

---

### Presence

#### GET /api/chat/users/:userId/presence

Get user presence status.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `userId` (string, required): User ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/users/user_123/presence \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### GET /api/chat/conversations/:conversationId/presence

Get presence status for all participants in a conversation.

**Authentication**: JWT Bearer token required

**Path Parameters**:
- `conversationId` (string, required): Conversation ID

**Example**:
```bash
curl -X GET http://localhost:5000/api/chat/conversations/conv_123/presence \
  -H "Authorization: Bearer <jwt-token>"
```

---

#### POST /api/chat/presence/batch

Get presence status for multiple users.

**Authentication**: JWT Bearer token required

**Request Body**:
```json
{
  "userIds": ["user_1", "user_2", "user_3"]
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/chat/presence/batch \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user_1", "user_2"]
  }'
```

---

## Error Handling

### Common Error Codes

- `400 Bad Request`: Invalid request data or parameters
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions or invalid internal secret
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Chat service unavailable

### Example Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "participantIds",
    "message": "At least 2 participants required for direct conversation"
  }
}
```

---

## Integration Notes

### Automatic User Sync

The backend automatically syncs users with the chat service when:
- A new user is created (client or freelancer registration)
- A user profile is updated

### Manual User Sync

To sync existing users in bulk:

```bash
# Sync all users
npm run chat:sync

# Dry run (test without syncing)
npm run chat:sync:dry

# Sync with options
npm run chat:sync -- --batch-size=100 --limit=1000
```

### Configuration

Ensure your `.env` file has:

```bash
CHAT_SERVICE_URL=http://localhost:3000
CHAT_INTERNAL_API_SECRET=your-secret-here
CHAT_SERVICE_ENABLED=true
```

The `CHAT_INTERNAL_API_SECRET` must match the chat service's `INTERNAL_API_SECRET` environment variable.

---

## Rate Limiting

The proxy forwards all requests to the chat service. Rate limiting is handled by the chat service itself.

---

## WebSocket Connection

For real-time messaging, clients should connect directly to the chat service WebSocket endpoint:

```
ws://chat.example.com
```

Use the JWT token in the Socket.IO handshake:

```javascript
const socket = io('ws://chat.example.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

## Support

For issues or questions:
1. Check chat service logs
2. Verify environment configuration
3. Test connection: `curl http://localhost:5000/api/chat/health`
4. Check authentication: Ensure JWT token is valid
