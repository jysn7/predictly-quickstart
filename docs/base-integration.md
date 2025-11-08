# BASE Integration

This document details how to integrate Predictly with the BASE platform for data persistence and user management.

## Overview

Predictly uses BASE as its primary data store in production mode. The integration handles:
- User profiles and statistics
- Predictions storage and updates
- Leaderboard calculations
- Activity feed generation

## Setting Up BASE Integration

### 1. Set Up Base Account

1. No account creation needed - Base Account is available via CDN
2. Add the Base Account script to your layout:

```typescript
// app/layout.tsx
<script src="https://cdn.base.org/base-account/latest.js"></script>
```

### 2. Environment Setup

No environment variables are required for Base Account integration. The SDK is loaded directly from the CDN.
```

For production, add these to your Vercel environment variables.

## Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;            // BASE user ID
  fid: string;           // Farcaster ID
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;     // ISO date
  updatedAt: string;     // ISO date
}
```

### Prediction
```typescript
interface Prediction {
  id: string;
  userId: string;
  prediction: string;
  confidence: number;
  category: string;
  expiryDate: string;    // ISO date
  status: 'pending' | 'settled' | 'void';
  outcome?: 'win' | 'lose' | 'void';
  createdAt: string;
  updatedAt: string;
}
```

### Leaderboard Entry
```typescript
interface LeaderboardEntry {
  userId: string;
  score: number;
  accuracy: number;
  totalPredictions: number;
  winStreak: number;
  rank: number;
}
```

## BASE SDK Usage

### Installation
```bash
npm install @baseapp/sdk
```

### Basic Setup
```typescript
import { BASE } from '@baseapp/sdk';

const base = new BASE({
  apiKey: process.env.BASE_API_KEY!,
  projectId: process.env.BASE_PROJECT_ID!,
});
```

### Example Operations

```typescript
// Create a prediction
const prediction = await base.predictions.create({
  userId,
  prediction,
  confidence,
  category,
  expiryDate
});

// Get user profile
const profile = await base.users.get(userId);

// Update leaderboard
const leaderboard = await base.leaderboard.get({
  limit: 10,
  offset: 0,
  orderBy: 'score',
  order: 'desc'
});

// Get feed
const feed = await base.feed.get({
  limit: 20,
  cursor,
  includeUserDetails: true
});
```

## Error Handling

```typescript
try {
  await base.predictions.create(/* ... */);
} catch (error) {
  if (error instanceof BASE.errors.ValidationError) {
    // Handle validation errors
  } else if (error instanceof BASE.errors.AuthenticationError) {
    // Handle auth errors
  } else {
    // Handle other errors
  }
}
```

## Webhook Integration

### 1. Configure Webhook URL

In your BASE dashboard:
1. Go to Project Settings
2. Add webhook endpoint: `https://your-domain.com/api/webhooks/base`
3. Select events to receive
4. Copy the webhook secret

### 2. Add Webhook Secret

```bash
BASE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Implement Webhook Handler

```typescript
// app/api/webhooks/base/route.ts
import { verifyBaseWebhook } from '@baseapp/sdk';

export async function POST(req: Request) {
  const signature = req.headers.get('x-base-signature');
  const body = await req.json();

  if (!verifyBaseWebhook(signature, body, process.env.BASE_WEBHOOK_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Handle webhook event
  switch (body.type) {
    case 'prediction.settled':
      await handlePredictionSettled(body.data);
      break;
    // Handle other events...
  }

  return new Response('OK');
}
```

## Demo Mode

When `NEXT_PUBLIC_USE_STATIC_DEMO=true`:
- BASE SDK calls are bypassed
- In-memory storage is used
- Data persists only for the session
- Perfect for local development

## Deployment Checklist

- [ ] Set up BASE project
- [ ] Configure API keys
- [ ] Set up webhooks
- [ ] Configure CORS
- [ ] Test all CRUD operations
- [ ] Monitor error rates
- [ ] Set up logging

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API key is valid
   - Check key permissions
   - Confirm project ID

2. **Rate Limiting**
   - Implement retries
   - Add request queuing
   - Monitor usage

3. **Data Sync**
   - Check webhook delivery
   - Verify event processing
   - Monitor latency

### Debugging

Enable debug logging:
```typescript
const base = new BASE({
  apiKey: process.env.BASE_API_KEY!,
  projectId: process.env.BASE_PROJECT_ID!,
  debug: true
});
```

## Performance Optimization

1. **Caching**
   - Cache leaderboard results
   - Cache user profiles
   - Use edge caching when possible

2. **Batch Operations**
   - Bulk create predictions
   - Batch update stats
   - Use transactions

3. **Query Optimization**
   - Use efficient filters
   - Implement pagination
   - Optimize includes

## Security Best Practices

1. **API Keys**
   - Rotate regularly
   - Use minimal permissions
   - Secure storage

2. **Data Access**
   - Validate user permissions
   - Sanitize inputs
   - Rate limit requests

3. **Monitoring**
   - Log security events
   - Monitor usage patterns
   - Alert on anomalies

## Migration Guide

### From Demo to Production

1. Set up BASE project
2. Export demo data
3. Import to BASE
4. Update environment
5. Deploy changes
6. Verify migration

### Version Updates

When BASE SDK updates:
1. Review changelog
2. Update dependencies
3. Test integration
4. Deploy changes

## Support

- [BASE Documentation](https://docs.base.app)
- [API Reference](https://api.base.app/docs)
- [Discord Community](https://discord.gg/base)
- [GitHub Issues](https://github.com/baseapp/sdk/issues)