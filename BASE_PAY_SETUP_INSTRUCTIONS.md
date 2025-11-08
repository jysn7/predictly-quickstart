# Installation Instructions for Base Pay

Complete the following steps to integrate Base Pay SDK into your Predictly app.

## Step 1: Install Base Pay Packages

Run this in the `predictly-quickstart` directory:

```powershell
# PowerShell (your shell)

# Navigate to project
cd predictly-quickstart

# Install Base Pay SDK
npm install @base-org/account @base-org/account-ui/react

# Verify installation
npm list @base-org/account @base-org/account-ui/react
```

**Expected output:**
```
predictly-quickstart@0.1.0
├── @base-org/account@0.x.x
└── @base-org/account-ui@0.x.x
```

## Step 2: Verify Files Created

Check that these files exist:

```powershell
# Check for Base Pay utilities
Test-Path -Path "app\utils\basePay.ts"

# Check for Coin Purchase Component  
Test-Path -Path "app\components\CoinPurchaseModal.tsx"

# Check for documentation
Test-Path -Path "BASE_PAY_INTEGRATION.md"
```

**All should return `True`**

## Step 3: Update Environment Variables

Edit `.env.local` and add:

```env
# Base Pay Configuration
NEXT_PUBLIC_BASE_NETWORK=testnet
NEXT_PUBLIC_TREASURY_WALLET=0xYourTreasuryWalletAddress
NEXT_PUBLIC_BASE_RPC=https://sepolia.base.org
```

## Step 4: Get Test USDC (Testnet)

1. Visit: https://faucet.circle.com/
2. Select "Base Sepolia"
3. Enter your wallet address
4. Claim 100 test USDC

## Step 5: Test the Integration

```powershell
# Start dev server
npm run dev

# The app will be available at:
# http://localhost:3000
```

## Step 6: Troubleshooting

**Error: "Cannot find module '@base-org/account'"**
```powershell
# Try reinstalling
npm install @base-org/account @base-org/account-ui/react --force
npm install
```

**Error: "Payment failed"**
- Check that you have test USDC in your wallet
- Verify treasury wallet address in `.env.local`
- Make sure testnet flag is set correctly

**Server build errors**
```powershell
# Clear Next.js cache
Remove-Item -Path ".next" -Recurse -Force
npm run build
```

## Files Modified/Created

### New Files
- `app/utils/basePay.ts` - Base Pay SDK integration
- `app/components/CoinPurchaseModal.tsx` - Coin purchase UI component
- `BASE_PAY_INTEGRATION.md` - Setup guide

### Existing Files (Already Ready)
- `app/api/coins/webhook.ts` - Already configured to receive Base Pay webhooks
- `app/api/coins/balance.ts` - Get user balance
- `app/api/bets/place.ts` - Place bets
- `app/utils/coinSystem.ts` - Client utilities

## Next: Using Base Pay in Your App

### Import and Use

```tsx
import CoinPurchaseModal from '@/app/components/CoinPurchaseModal';
import { useState } from 'react';

export function YourComponent() {
  const [showCoinModal, setShowCoinModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowCoinModal(true)}>
        💰 Buy Coins
      </button>

      <CoinPurchaseModal
        isOpen={showCoinModal}
        onClose={() => setShowCoinModal(false)}
        userWalletAddress="0x..."
        userId="user_123"
        treasuryWalletAddress={process.env.NEXT_PUBLIC_TREASURY_WALLET!}
        onPurchaseComplete={(paymentId) => {
          console.log('Payment complete:', paymentId);
          // Refresh balance, show success, etc.
        }}
      />
    </>
  );
}
```

## Package Versions

| Package | Version | Purpose |
|---------|---------|---------|
| `@base-org/account` | Latest | Base Pay SDK |
| `@base-org/account-ui/react` | Latest | UI components |
| `viem` | ^2.38.6 | (Already installed) Web3 library |
| `next` | 15.3.4 | (Already installed) Framework |

## Documentation Links

- **Base Pay Docs:** https://docs.base.org/base-account/guides/accept-payments
- **NPM Packages:** https://www.npmjs.com/package/@base-org/account
- **SDK Playground:** https://base.github.io/account-sdk/pay-playground
- **Test Faucet:** https://faucet.circle.com/

## Support

For issues or questions:
1. Check `BASE_PAY_INTEGRATION.md` for detailed setup
2. Review `app/utils/basePay.ts` for implementation details
3. Check `app/components/CoinPurchaseModal.tsx` for component usage
4. Visit Base docs: https://docs.base.org/base-account/guides/accept-payments

