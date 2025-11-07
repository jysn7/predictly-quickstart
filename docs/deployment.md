# Deployment Guide

This document covers how to deploy Predictly to production environments, with a focus on Vercel deployment.

## Prerequisites

Before deploying, ensure you have:
1. A Vercel account
2. Required API keys (BASE, OpenAI)
3. A Farcaster app registration
4. A custom domain (optional)

## Environment Setup

### Required Environment Variables

```bash
# Authentication
NEXT_PUBLIC_URL=https://your-domain.com

# BASE Integration (Production)
BASE_API_KEY=your_base_api_key
BASE_PROJECT_ID=your_project_id
BASE_API_URL=https://api.base.app

# OpenAI Integration
OPENAI_API_KEY=your_openai_key

# Demo Mode (set to false for production)
NEXT_PUBLIC_USE_STATIC_DEMO=false
```

### Optional Environment Variables

```bash
# Monitoring and Analytics
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GA_ID=your_ga_id

# Performance
EDGE_CACHE_TTL=3600
MAX_CACHE_SIZE=100
```

## Deployment Steps

### 1. Prepare for Deployment

```bash
# Install dependencies
npm install

# Build locally to verify
npm run build

# Run tests
npm test
```

### 2. Deploy to Vercel

#### Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Using GitHub Integration

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Add environment variables
4. Deploy

### 3. Configure Domain

1. Add custom domain in Vercel
2. Update DNS settings
3. Update `NEXT_PUBLIC_URL`
4. Verify HTTPS setup

## Production Checklist

### Performance
- [ ] Enable Edge Caching
- [ ] Configure CDN
- [ ] Optimize images
- [ ] Enable compression

### Security
- [ ] Set up CSP headers
- [ ] Enable HSTS
- [ ] Configure CORS
- [ ] Review permissions

### Monitoring
- [ ] Set up error tracking
- [ ] Configure logging
- [ ] Add uptime monitoring
- [ ] Set up alerts

### SEO
- [ ] Add meta tags
- [ ] Create sitemap
- [ ] Add robots.txt
- [ ] Verify analytics

## Deployment Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "Cache-Control": "no-cache"
      }
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['assets.base.app'],
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store'
        }
      ]
    }
  ]
}
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - uses: vercel/actions/cli@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoring and Analytics

### Error Tracking

```typescript
// pages/_app.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN
});
```

### Performance Monitoring

```typescript
// utils/monitoring.ts
export function trackAPILatency(route: string, duration: number) {
  // Send to monitoring service
}
```

## Rollback Procedure

### Using Vercel Dashboard
1. Go to Deployments
2. Find last working deployment
3. Click "..." > "Promote to Production"

### Using Vercel CLI
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Maintenance Mode

### Enable Maintenance Mode
```bash
# Set environment variable
vercel env add MAINTENANCE_MODE production

# Update status page
vercel env add STATUS_PAGE_MESSAGE production
```

### Disable Maintenance Mode
```bash
vercel env rm MAINTENANCE_MODE production
```

## Production Debugging

### View Logs
```bash
# Stream logs
vercel logs

# Filter by route
vercel logs --path /api/predictions
```

### Inspect Environment
```bash
# List environment variables
vercel env ls

# Pull production env locally
vercel env pull .env.production
```

## Performance Optimization

### Edge Caching
```typescript
// pages/api/feed.ts
export const config = {
  runtime: 'edge',
  regions: ['sfo1', 'iad1']
}
```

### API Route Optimization
```typescript
// Cache expensive operations
import { withCache } from '../utils/cache';

export default withCache(async function handler(req, res) {
  // Handler code
}, { ttl: 3600 });
```

## Support and Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs
   - Verify dependencies
   - Check environment variables

2. **Runtime Errors**
   - Check Sentry/logs
   - Verify API endpoints
   - Check memory usage

3. **Performance Issues**
   - Review caching
   - Check CDN config
   - Monitor database queries

### Getting Help

- Vercel Support: [support.vercel.com](https://support.vercel.com)
- Project Discord: [discord.gg/predictly](https://discord.gg/predictly)
- GitHub Issues: [github.com/jysn7/predictly-quickstart/issues](https://github.com/jysn7/predictly-quickstart/issues)