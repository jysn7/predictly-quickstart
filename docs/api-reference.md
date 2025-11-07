# API Reference

This document details all the API endpoints available in Predictly. Each endpoint includes its purpose, request/response formats, and authentication requirements.

## Authentication

All API routes except `/api/auth` require a valid Farcaster JWT in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Core Endpoints

### Authentication
`GET /api/auth`
- Verifies Farcaster JWT and returns user information
- No authorization required (used to validate tokens)
- Response: `{ success: true, user: { fid: string, issuedAt: number, expiresAt: number } }`

### AI Analysis
`POST /api/ai`
- Generates AI predictions and explanations
- Request body:
  ```typescript
  {
    prompt: string;      // The analysis prompt
    max_tokens?: number; // Optional max response length
    model?: string;      // Optional model override
  }
  ```
- Response: `{ text: string }` or `{ error: string }`
- Rate limit: 10 requests per minute per user

### Predictions

#### Create Prediction
`POST /api/predictions`
- Creates a new prediction
- Request body:
  ```typescript
  {
    userId: string;
    prediction: string;
    confidence: number;
    category: string;
    expiryDate: string; // ISO date
  }
  ```
- Response: Complete prediction object including id, status, timestamps

#### List Predictions
`GET /api/predictions`
- Lists predictions, optionally filtered by user
- Query params:
  - `userId`: Optional user ID to filter
  - `limit`: Max records (default 20)
  - `offset`: Pagination offset
- Response: Array of prediction objects

#### Update Prediction
`PUT /api/predictions`
- Updates prediction status/outcome
- Request body:
  ```typescript
  {
    predictionId: string;
    status: "pending" | "settled" | "void";
    outcome?: "win" | "lose" | "void";
  }
  ```
- Response: Updated prediction object

### Users

#### Get User Profile
`GET /api/users/[userId]`
- Returns user profile, predictions, and stats
- Path params: `userId`
- Response:
  ```typescript
  {
    profile: {
      id: string;
      displayName: string;
      bio?: string;
      avatarUrl?: string;
    };
    predictions: Array<Prediction>;
    stats: {
      totalPredictions: number;
      accuracy: number;
      streak: number;
    }
  }
  ```

#### Update User Profile
`PUT /api/users/[userId]`
- Updates user profile information
- Path params: `userId`
- Request body:
  ```typescript
  {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }
  ```
- Response: Updated user profile object

### Feed

#### Get Activity Feed
`GET /api/feed`
- Returns paginated prediction feed
- Query params:
  - `limit`: Max records (default 20)
  - `cursor`: Pagination cursor
  - `includeUserDetails`: Include user info (default true)
- Response:
  ```typescript
  {
    items: Array<{
      id: string;
      userId: string;
      prediction: string;
      confidence: number;
      createdAt: string;
      user?: UserProfile;
    }>;
    nextCursor?: string;
  }
  ```

### Leaderboard

#### Get Leaderboard
`GET /api/leaderboard`
- Returns ranked list of top predictors
- Query params:
  - `limit`: Max records (default 10)
  - `offset`: Pagination offset
  - `orderBy`: Sort field (default "score")
  - `order`: Sort direction (default "desc")
- Response: Array of leaderboard entries with user details and stats

## Error Handling

All endpoints return errors in a consistent format:
```typescript
{
  error: string;        // Human-readable error message
  code?: string;        // Optional error code
  details?: unknown;    // Optional additional error context
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad request (invalid parameters)
- 401: Unauthorized (missing/invalid JWT)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 429: Too many requests
- 500: Server error

## Rate Limiting

- Authentication: 60 requests per minute per IP
- AI endpoints: 10 requests per minute per user
- Other endpoints: 120 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <unix_timestamp>
```

## WebSocket Events

_Currently not implemented. Planned for future versions._

## Development Notes

- All timestamps are in ISO 8601 format
- All IDs are strings (UUIDs or BASE-specific formats)
- Pagination uses cursor-based or offset/limit depending on endpoint
- In demo mode (`NEXT_PUBLIC_USE_STATIC_DEMO=true`), all endpoints use in-memory storage