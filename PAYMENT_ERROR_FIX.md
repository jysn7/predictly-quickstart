# 🔧 Payment Error Troubleshooting Guide

**Error:** `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

---

## 🎯 What Was Fixed

Your app was getting an HTML error page (starting with `<!DOCTYPE`) instead of JSON when checking payment status. This is typically a 404 or 500 error from the API.

### Changes Made:

1. **Enhanced Error Handling in `basePay.ts`**
   - Better logging for payment status checks
   - Graceful handling of polling errors
   - Returns meaningful error messages
   - Max 10 consecutive errors before giving up

2. **Improved Modal Error Messages**
   - Distinguishes between timeout, failed, and error states
   - Provides actionable feedback to users
   - Shows actual error details when available

3. **Testnet Flag Consistency**
   - Modal now explicitly passes testnet flag to polling function
   - Uses `NEXT_PUBLIC_BASE_NETWORK` environment variable
   - Ensures polling uses same network as payment initialization

---

## ✅ Root Cause Analysis

The JSON error likely occurred because:

1. **Network Mismatch:** Payment was initiated on testnet but status was checked on mainnet (or vice versa)
2. **API Error Response:** Base Pay API returned an error page instead of JSON
3. **Timeout Handling:** Long delays before timeout caused confusing error messages

**Solution:** The testnet flag is now properly passed through the entire flow and errors are caught earlier.

---

## 🧪 Testing the Fix

### Step 1: Get Test USDC
```
1. Visit: https://faucet.circle.com/
2. Select: Base Sepolia (not mainnet!)
3. Enter: Your wallet address
4. Receive: 100 test USDC (free, instant)
```

### Step 2: Test Purchase Flow
1. Go to: http://localhost:3000/predict
2. Click: "Buy Coins" button
3. Select: A coin package (e.g., "100 PDC - $10")
4. Click: "Pay with Base"
5. Approve in wallet popup
6. Wait for success message
7. Check browser console for logs

### Step 3: Verify Balance Update
```
Expected flow:
✅ "Payment processing..." (pending)
✅ "Payment successful! Coins are being added..."
✅ Modal closes automatically
✅ Balance updates on page
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Payment verification timed out"
**Cause:** Status API took >60 seconds to respond
**Solution:**
- Try again (should be faster second time)
- Check your internet connection
- Try different browser if issue persists

### Issue 2: Still seeing HTML DOCTYPE error
**Cause:** Different API error
**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors - screenshot and check
4. Check Network tab - what's the API response?
5. Visit https://sepolia.basescan.org/ to verify transaction status manually

### Issue 3: "Failed to check payment status"
**Cause:** Payment API unreachable or returning error
**Solution:**
- Verify you're on Base Sepolia (not mainnet)
- Check environment variables in `.env.local`
- Ensure `NEXT_PUBLIC_BASE_NETWORK=testnet`
- Try fresh tab (Ctrl+Shift+Delete cache)

### Issue 4: Payment shows "completed" but no coins received
**Cause:** Webhook handler or smart contract issue
**Solution:**
1. Check transaction on Basescan:
   - Go: https://sepolia.basescan.org/
   - Search your wallet address
   - Look for USDC transfer from you
2. Verify treasury wallet received payment
3. Check contract on Basescan for `buyCoins` calls
4. Try test payment again

---

## 📊 Environment Setup Checklist

Make sure these are set in `.env.local`:

```env
# Network Configuration (MUST BE TESTNET)
NEXT_PUBLIC_BASE_NETWORK=testnet
NEXT_PUBLIC_BASE_RPC=https://sepolia.base.org

# Payment Configuration
NEXT_PUBLIC_TREASURY_WALLET=0xA66D93cc7DbEc8a866aD801c32e4FFa966109e82

# Base Pay SDK
NEXT_PUBLIC_BASE_ACCOUNT_CLIENT_ID=your_actual_client_id_here
NEXT_PUBLIC_BASE_ACCOUNT_CALLBACK_URL=http://localhost:3000/api/auth/callback

# AI
OPENAI_API_KEY=sk-proj-...

# Demo Mode
NEXT_PUBLIC_USE_STATIC_DEMO=false
```

---

## 🔍 Debugging Steps

### Enable Verbose Logging
All console.log messages now include emoji prefixes for easy scanning:

```
🎯 Starting coin purchase...
💳 Initializing Base Pay...
✅ Payment popup shown
⏳ Payment initiated...
🔍 Checking payment status...
📊 Payment Status: completed
🎉 Payment confirmed and settled
💾 Logging coin purchase to database...
⏳ Waiting for coins to be credited...
💰 New balance: 100 PDC
```

### View Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Make a purchase
4. Look for these requests:
   - `pay` - Payment initialization (should succeed)
   - `getPaymentStatus` - Status polling (should return 200 OK with JSON)
   - `/api/coins/balance` - Balance check (should return JSON)

### Check Backend Webhook
The webhook at `/api/coins/webhook` should:
1. Receive payment.confirmed event from Base Pay
2. Call smart contract `buyCoins` function
3. Wait for transaction confirmation
4. Return success JSON

---

## 📈 Expected Payment Flow

```
User clicks "Pay with Base"
         ↓
"Payment processing..." message appears
         ↓
Modal disables all buttons
         ↓
Browser polls /getPaymentStatus every 1 second (max 60 times)
         ↓
When status === "completed":
  - Show "Payment successful!"
  - Wait 2 seconds for backend webhook
  - Fetch updated balance
  - Close modal
  - Update balance display
         ↓
Success! Coins available
```

---

## 🚀 What Happens Behind the Scenes

### Frontend (Your Browser):
```
1. initializeBasePay()
   ↓ Shows wallet popup
   ↓ User confirms payment
   ↓ Returns paymentId
   
2. pollPaymentCompletion()
   ↓ Calls getPaymentStatus every 1s
   ↓ Base Pay API checks blockchain
   ↓ Returns "pending" or "completed"
   
3. When completed:
   ↓ getBalance() - fetch from contract
   ↓ Close modal
   ↓ Update UI
```

### Backend (Server):
```
1. Base Pay Payment Processor
   ↓ Takes USDC from user wallet
   ↓ Sends to treasury wallet
   ↓ <2 seconds settlement on Base
   
2. Webhook Handler (/api/coins/webhook)
   ↓ Receives payment.confirmed event
   ↓ Calls smart contract buyCoins()
   ↓ Coins minted to user wallet
   ↓ Transaction confirmed
```

---

## ✨ Recent Improvements

**What Changed:**
1. ✅ Better testnet flag handling
2. ✅ Improved error messages
3. ✅ Enhanced logging
4. ✅ Graceful error recovery
5. ✅ Clear distinction between different failure types

**Result:**
- No more HTML error pages in modal
- Better debugging information
- More reliable polling
- Clear user feedback

---

## 📞 Still Having Issues?

1. **Check console logs** - Look for red errors with 🎯, 💳, ⏳ prefixes
2. **Verify testnet** - Confirm `NEXT_PUBLIC_BASE_NETWORK=testnet`
3. **Get fresh test USDC** - https://faucet.circle.com/
4. **Try fresh browser tab** - Clear cache (Ctrl+Shift+Delete)
5. **Check Base Sepolia Scan** - https://sepolia.basescan.org/

**Common Fix:** Most issues resolve by:
- Ensuring testnet is set in `.env.local`
- Getting fresh test USDC from faucet
- Refreshing browser
- Trying again

---

## 🎉 Success Indicators

You'll know it's working when:
✅ Modal shows "Payment processing..." 
✅ Then shows "Payment successful!"
✅ Modal closes automatically
✅ Balance updates on page
✅ Console shows all green checkmarks (✓)
✅ No red errors in console
✅ No HTML DOCTYPE error messages

**You're all set!** 🚀
