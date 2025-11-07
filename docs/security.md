# Security Guide

This document outlines security considerations and best practices for the Predictly application.

## Authentication & Authorization

### Farcaster Authentication
- All user authentication is handled via Farcaster Quick Auth
- JWTs are verified server-side
- Tokens stored in memory only
- Auto-logout on token expiration

### API Authorization
```typescript
// Example of protected API route
export async function handler(req: NextRequest) {
  // Verify JWT token
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const user = await verifyToken(token);
    // Continue with authenticated request
  } catch (error) {
    return new Response('Invalid token', { status: 401 });
  }
}
```

## Data Protection

### Environment Variables
- Never commit `.env` files
- Use different keys for development/production
- Rotate keys regularly
- Use secret managers in production

### Sensitive Data Handling
```typescript
// Example of sensitive data redaction
const logSafeUser = (user: User) => {
  const { password, ...safeUser } = user;
  return safeUser;
};
```

## API Security

### Rate Limiting
```typescript
// Example rate limit middleware
export function rateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for');
  const limit = 100; // requests
  const window = 60000; // milliseconds

  if (isRateLimited(ip, limit, window)) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

### Input Validation
```typescript
// Example validation middleware
export function validatePrediction(req: NextRequest) {
  const { prediction, confidence } = await req.json();

  if (typeof prediction !== 'string' || prediction.length > 1000) {
    return new Response('Invalid prediction', { status: 400 });
  }

  if (typeof confidence !== 'number' || confidence < 0 || confidence > 100) {
    return new Response('Invalid confidence', { status: 400 });
  }
}
```

## CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_URL
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  }
};
```

## Content Security Policy

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  }
};
```

## Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

## Error Handling

### Safe Error Messages
```typescript
// util/errors.ts
export const publicErrorMessages = {
  AUTH_FAILED: 'Authentication failed',
  INVALID_INPUT: 'Invalid input provided',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'An unexpected error occurred'
};

// API route
export async function handler(req: NextRequest) {
  try {
    // ... handler code
  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(publicErrorMessages.SERVER_ERROR, { status: 500 });
  }
}
```

## Dependency Security

### NPM Audit
Regular security audits:
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Generate report
npm audit --json > audit.json
```

### Package Verification
```bash
# Verify installed packages
npm verify-tree

# Check for outdated packages
npm outdated
```

## Monitoring & Logging

### Security Event Logging
```typescript
// util/security-logger.ts
export function logSecurityEvent(
  eventType: string,
  details: object,
  severity: 'low' | 'medium' | 'high'
) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: eventType,
    severity,
    details
  }));
}
```

### Failed Authentication Monitoring
```typescript
export async function trackAuthFailure(
  attempt: { ip: string, timestamp: number }
) {
  // Track failed attempts
  // Alert on suspicious patterns
}
```

## BASE API Security

### API Key Management
- Store BASE_API_KEY securely
- Use minimal required permissions
- Rotate keys regularly
- Monitor key usage

### Request Signing
```typescript
// util/base-auth.ts
export function signBaseRequest(
  payload: object,
  apiKey: string
): string {
  // Sign request payload
  return signature;
}
```

## Development Guidelines

### Security Checklist
- [ ] No secrets in code
- [ ] Input validation
- [ ] Rate limiting
- [ ] Error handling
- [ ] Audit logging
- [ ] HTTPS only
- [ ] Updated dependencies
- [ ] Security headers

### Code Review Guidelines
- Check for SQL injection
- Verify authorization
- Review error handling
- Check input validation
- Review dependency updates

## Incident Response

### Response Plan
1. Identify incident
2. Contain breach
3. Eradicate threat
4. Recover systems
5. Learn and improve

### Contact Information
- Security team: security@example.com
- Emergency contact: +1-xxx-xxx-xxxx
- Bug bounty: https://hackerone.com/example

## Compliance

### Data Protection
- User data encryption
- Secure transmission
- Access controls
- Retention policies

### Privacy Policy
- Data collection
- Usage terms
- User rights
- Contact information

## Regular Security Tasks

### Daily
- Monitor auth logs
- Check error rates
- Review alerts

### Weekly
- Dependency updates
- Security patches
- Access review

### Monthly
- Full security audit
- Penetration testing
- Policy review

## Additional Resources

- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org)
- [Next.js Security](https://nextjs.org/docs/authentication)
- [Web Security Guidelines](https://web.dev/security-headers)