# AI Agent Instructions for Predictly Mini App

## Project Overview
This is a Mini App built for the Base ecosystem using OnchainKit and Farcaster SDK. It's a Next.js TypeScript application designed to integrate with Base and Farcaster platforms.

## Key Architecture Components

### Framework & Dependencies
- Next.js 15.x with TypeScript and React 19
- OnchainKit for Base integration
- Farcaster SDK for social features
- React Query for data management

### Core Files
- `minikit.config.ts`: Central configuration for the Mini App manifest
- `app/layout.tsx`: Root layout with metadata generation for Farcaster frames
- `app/rootProvider.tsx`: Main provider wrapper for app-wide state/context

### Directory Structure
```
app/
├── api/        # API routes (authentication, webhooks)
├── dashboard/  # Dashboard views
├── feed/       # Content feed
├── predict/    # Prediction interface
└── settings/   # User settings
```

## Development Workflows

### Environment Setup
1. Required environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_PROJECT_NAME="Your App Name"
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=<CDP-API-KEY>
   NEXT_PUBLIC_URL=<APP-URL>
   ```

### Common Commands
- Development: `npm run dev`
- Production build: `npm run build`
- Linting: `npm run lint`

## Project-Specific Patterns

### Frame Integration
- Frame metadata is generated in `layout.tsx` using `generateMetadata()`
- Frame configuration follows the Farcaster Mini App specification
- Use `SafeArea` component from OnchainKit for proper mobile layout

### Configuration Pattern
- All app-wide configuration lives in `minikit.config.ts`
- Environment variables are centralized with fallbacks to development values
- Use `ROOT_URL` constant for generating absolute URLs

### Style Conventions
- CSS Modules for component-specific styles (`.module.css` files)
- Font variables: `--font-inter` and `--font-source-code-pro`
- Safe area padding handled by OnchainKit's `SafeArea` component

## Integration Points
- Farcaster authentication via `/api/auth`
- Webhook endpoint at `/api/webhook` for platform events
- OnchainKit API for Base ecosystem integration
- Frame metadata for Farcaster embeds

## Current Status
- Working on Base and Farcaster integration
- No official tokens or apps associated - see disclaimer in README.md