# Predictly

A decentralized predictions platform built on BASE. Users can make predictions about events, track their accuracy, and compete on the leaderboard. Powered by AI for prediction analysis and explanation.

![Vercel Deploy](https://therealsujitk-vercel-badge.vercel.app/?app=predictly-quickstart) [![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 Create and track predictions with confidence levels
- 🤖 AI-powered prediction analysis and explanations
- 📊 Global leaderboard with prediction accuracy tracking
- 🔄 Activity feed showing recent predictions
- 🔒 Farcaster-based authentication
- 🎨 Clean, modern UI with dark theme

## Prerequisites

Before getting started, make sure you have:

* A [Base Account](https://docs.base.org/base-account)
* A [Farcaster](https://farcaster.xyz/) account
* [Vercel](https://vercel.com/) account for hosting the application

## Getting Started

## Quick Start

```bash
# Install dependencies
npm install

# Copy example env and configure
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Setup

Create `.env.local` with these variables:

```bash
# Required for authentication
NEXT_PUBLIC_URL=http://localhost:3000

# Required for AI features (optional in demo mode)
OPENAI_API_KEY=your_openai_key_here

# Required for BASE integration (optional in demo mode)
BASE_API_KEY=your_base_api_key_here
BASE_PROJECT_ID=your_project_id_here
BASE_API_URL=https://api.base.app

# Set to 'true' to run frontend in static demo mode
NEXT_PUBLIC_USE_STATIC_DEMO=true
```

## Demo Mode vs Production

The app can run in two modes:

### Demo Mode
- Set `NEXT_PUBLIC_USE_STATIC_DEMO=true`
- Uses in-memory storage and mock AI responses
- No external API dependencies
- Perfect for local development and prototypes

### Production Mode
- Set `NEXT_PUBLIC_USE_STATIC_DEMO=false`
- Requires BASE credentials and OpenAI API key
- Persists data and uses real AI analysis
- Required for deployed production instances

## Documentation

- [API Reference](docs/api-reference.md) - Detailed API endpoints and schemas
- [Architecture](docs/architecture.md) - System design and data flow
- [Authentication](docs/authentication.md) - Farcaster auth integration
- [BASE Integration](docs/base-integration.md) - How to connect to BASE
- [Contributing](docs/contributing.md) - Development guidelines
- [Deployment](docs/deployment.md) - Deployment instructions
- [Security](docs/security.md) - Security considerations

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Authentication:** Farcaster Quick Auth
- **Styling:** CSS Modules + CSS Variables
- **Database:** BASE (production) / In-memory (demo)
- **AI:** OpenAI GPT API
- **Deploy:** Vercel

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

- [Issue Tracker](https://github.com/jysn7/predictly-quickstart/issues)
- [Discussions](https://github.com/jysn7/predictly-quickstart/discussions)

### 1. Preview Your App

Go to [base.dev/preview](https://base.dev/preview) to validate your app:

1. Add your app URL to view the embeds and click the launch button to verify the app launches as expected
2. Use the "Account association" tab to verify the association credentials were created correctly
3. Use the "Metadata" tab to see the metadata added from the manifest and identify any missing fields

### 2. Publish to Base App

To publish your app, create a post in the Base app with your app's URL.

## Learn More

For detailed step-by-step instructions, see the [Create a Mini App tutorial](https://docs.base.org/docs/mini-apps/quickstart/create-new-miniapp/) in the Base documentation.


---

## Disclaimer  

This project is a **demo application** created by the **Base / Coinbase Developer Relations team** for **educational and demonstration purposes only**.  

**There is no token, cryptocurrency, or investment product associated with Cubey, Base, or Coinbase.**  

Any social media pages, tokens, or applications claiming to be affiliated with, endorsed by, or officially connected to Cubey, Base, or Coinbase are **unauthorized and fraudulent**.  

We do **not** endorse or support any third-party tokens, apps, or projects using the Cubey name or branding.  

> [!WARNING]
> Do **not** purchase, trade, or interact with any tokens or applications claiming affiliation with Coinbase, Base, or Cubey.  
> Coinbase and Base will never issue a token or ask you to connect your wallet for this demo.  

For official Base developer resources, please visit:  
- [https://base.org](https://base.org)  
- [https://docs.base.org](https://docs.base.org)  

---
