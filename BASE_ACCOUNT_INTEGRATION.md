# Base Account Integration Summary

## Overview
All pages and components in the Predictly application have been verified and updated to properly connect to the Base Account SDK via the official CDN.

## Architecture

### Script Loading
**File:** `app/components/BaseScriptLoader.tsx`
- Loads the Base Account SDK from: `https://unpkg.com/@base-org/account/dist/base-account.min.js`
- Initializes the SDK with app metadata
- Exposes `window.baseProvider` and `window.baseSDK` globally
- Uses `beforeInteractive` strategy for early loading

### Connection Management
**File:** `app/components/Sidebar.tsx`
- Primary connection UI component
- Displays connection status: `loading`, `ready`, `not-available`, `no-wallet`
- Uses `wallet_connect` method with SIWE (Sign In With Ethereum)
- Auto-restores previous connections via `eth_accounts`
- Handles connection/disconnection with proper error codes

## Pages with Base Account Integration

### 1. Home Page (`app/page.tsx`)
- **Connection Method:** `wallet_connect` via `baseProvider.request()`
- **Purpose:** Optional - allows users to connect before joining waitlist
- **Connection Status:** Shows account address if connected
- **SIWE Support:** Yes, with random nonce generation

### 2. Predict Page (`app/predict/page.tsx`)
- **Connection Method:** No direct connection logic (uses Sidebar)
- **Purpose:** Display predictions from AI
- **Bet Integration:** Connected via PlaceBetButton component

### 3. Feed Page (`app/feed/page.tsx`)
- **Connection Method:** No direct connection logic (uses Sidebar)
- **Purpose:** Display community predictions
- **Interactive:** Explain button uses AI (no wallet required)

### 4. Leaderboard Page (`app/leaderboard/page.tsx`)
- **Connection Method:** No direct connection logic
- **Purpose:** Display user rankings
- **Data Source:** Mock data for demo

### 5. Dashboard Page (`app/dashboard/page.tsx`)
- **Connection Method:** No direct connection logic (uses Sidebar)
- **Purpose:** Show user's predictions
- **Betting:** Integrated via PredictionCard component

### 6. Profile Page (`app/profile/[userId]/page.tsx`)
- **Connection Method:** No direct connection logic
- **Purpose:** Display user profile stats
- **Data Source:** Mock user data for demo

### 7. Settings Page (`app/settings/page.tsx`)
- **Connection Method:** Optional for wallet management
- **Purpose:** User preferences
- **Wallet Control:** Button to connect/manage wallet

### 8. Success Page (`app/success/page.tsx`)
- **Connection Method:** No connection logic
- **Purpose:** Success confirmation page
- **Navigation:** Routes to dashboard after success

## Components with Base Account Integration

### PlaceBetButton (`app/components/PlaceBetButton.tsx`)
```typescript
// Gets connected accounts
const accounts = await window.baseProvider.request({
  method: "eth_accounts",
  params: [],
});

// Records bet via API
const response = await fetch('/api/predictions/bets', {
  method: 'POST',
  body: JSON.stringify({
    userId: userAccount,
    predictionId,
    amount,
    transactionHash,
  })
});
```

### PredictionCard (`app/components/PredictionCard.tsx`)
- Displays predictions with betting UI
- Integrates PlaceBetButton for bet placement
- Shows connection status via PlaceBetButton errors

### Sidebar (`app/components/Sidebar.tsx`)
- Central connection hub for the entire app
- Auto-restores connections on page load
- Displays connection status with visual indicators
- Provides connect/disconnect buttons

## Utility Functions (`app/utils/base.ts`)

### isValidConfig()
- Checks if `baseProvider` is available
- Used to determine if SDK loaded successfully

### getBaseAccountAddress()
- Retrieves connected account address
- Returns null if not connected
- Throws error if provider unavailable

### isConnectedToBase()
- Checks if wallet is currently connected
- Returns boolean status
- Used for conditional rendering and validation

## Connection Flow

### Initial Page Load
1. `BaseScriptLoader` loads SDK from CDN
2. SDK initializes and exposes `window.baseProvider`
3. `Sidebar` component checks for previous connections
4. If connection exists, auto-restores via `eth_accounts`
5. Display connection status

### User Connection
1. User clicks "Connect Base Account" button
2. Sidebar generates SIWE nonce
3. Calls `wallet_connect` method
4. User approves in Base wallet
5. Receives account address
6. Stores address in component state
7. Displays confirmation with address

### Betting Flow
1. User enters bet amount
2. Clicks "Place Bet" button
3. PlaceBetButton checks `baseProvider` availability
4. Retrieves connected account via `eth_accounts`
5. Records bet in `/api/predictions/bets`
6. Displays success or error

## Environment Requirements

### Required Files
- `app/components/BaseScriptLoader.tsx` - Must be imported in `layout.tsx`
- `app/components/Sidebar.tsx` - Must be included in `layout.tsx`
- `app/globals.css` - Contains UI styles

### API Endpoints
- `GET /api/predictions/bets` - Retrieve bets
- `POST /api/predictions/bets` - Record new bet

### Configuration
- No API keys required for Base Account SDK
- Public CDN URL: `https://unpkg.com/@base-org/account/dist/base-account.min.js`
- Chain ID: `0x2105` (Base Mainnet)

## Error Handling

### Connection Errors
- **Code 4001:** User rejected connection request
- **Code -32002:** Connection request already pending
- **Other:** Display "Base Account not available"

### Bet Placement Errors
- Provider not available: "Base Account not available"
- No accounts connected: "No accounts connected"
- API failure: Show error message from server

## Testing Checklist

- [ ] Base Account SDK loads successfully (check console)
- [ ] Sidebar connects to Base wallet
- [ ] Connection status shows correctly
- [ ] Auto-restore works on page refresh
- [ ] Disconnect button works
- [ ] PlaceBetButton validates connection
- [ ] Bets are recorded in API
- [ ] All pages render without errors
- [ ] Mobile sidebar works correctly
- [ ] Settings page shows connection controls

## Notes

- All pages use the same `baseProvider` instance
- Connection state is managed per-component (no global state management)
- SIWE nonce generated fresh on each connection attempt
- Mock data used for demo purposes (no real transactions)
- No external wallet libraries needed - pure CDP integration
