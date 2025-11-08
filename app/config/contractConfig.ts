// Contract deployment configuration and ABI for PredictlyCoin
// Uses Viem for contract interaction (compatible with Base blockchain)

import { defineChain } from 'viem';

// ==================== CONTRACT CONFIGURATION ====================

/**
 * BASE NETWORK DEPLOYMENT CONFIG
 * Network: Base (Mainnet or Testnet)
 * 
 * Deployment Instructions:
 * 1. Compile: npx hardhat compile
 * 2. Deploy: npx hardhat run scripts/deploy.ts --network base
 * 3. Update PREDICTLY_COIN_ADDRESS with deployed address
 * 4. Verify on Basescan (optional but recommended)
 */

export const BASE_MAINNET = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
});

export const BASE_SEPOLIA = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Sepolia Basescan', url: 'https://sepolia.basescan.org' },
  },
});

export const CONTRACT_CONFIG = {
  // Base Mainnet
  MAINNET: {
    NETWORK_ID: 8453,
    RPC_URL: 'https://mainnet.base.org',
    CHAIN_ID: 8453,
    BLOCK_EXPLORER: 'https://basescan.org',
    CHAIN: BASE_MAINNET,
  },
  
  // Base Sepolia Testnet
  TESTNET: {
    NETWORK_ID: 84532,
    RPC_URL: 'https://sepolia.base.org',
    CHAIN_ID: 84532,
    BLOCK_EXPLORER: 'https://sepolia.basescan.org',
    CHAIN: BASE_SEPOLIA,
  },
};

// ==================== DEPLOYED CONTRACT ADDRESSES ====================

export const PREDICTLY_COIN_ADDRESS = {
  MAINNET: '0x0000000000000000000000000000000000000000', // Update after deployment
  TESTNET: '0x0000000000000000000000000000000000000000', // Update after deployment
};

// Treasury wallet that receives app fees
export const TREASURY_WALLET = {
  MAINNET: '0x0000000000000000000000000000000000000000', // Update with actual treasury wallet
  TESTNET: '0x0000000000000000000000000000000000000000', // Update with actual treasury wallet
};

// ==================== CONTRACT ABI ====================

export const PREDICTLY_COIN_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_treasuryWallet',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'CoinsPurchased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'bettor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'betId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'matchId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'prediction',
        type: 'string',
      },
    ],
    name: 'BetPlaced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'betId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'winnings',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'won',
        type: 'bool',
      },
    ],
    name: 'BetResolved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'netWinnings',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'WinningsDistributed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'CoinsWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newBalance',
        type: 'uint256',
      },
    ],
    name: 'BalanceUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'transactionId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'txType',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TransactionLogged',
    type: 'event',
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'buyCoins',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getBalance',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getUserCoinStats',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: 'current',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'purchased',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'won',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'withdrawn',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'placeBet',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'matchId',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'prediction',
        type: 'string',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getBet',
    inputs: [
      {
        internalType: 'uint256',
        name: 'betId',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'betId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'bettor',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'matchId',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amountBet',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'prediction',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'createdAt',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'resolved',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'won',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'winnings',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'payoutRecipient',
            type: 'address',
          },
        ],
        internalType: 'struct PredictlyCoin.Bet',
        name: '',
        type: 'tuple',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getUserBets',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getUserBetCount',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'resolveBet',
    inputs: [
      {
        internalType: 'uint256',
        name: 'betId',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'won',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'multiplier',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getTreasuryStats',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'withdrawCoins',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getTransaction',
    inputs: [
      {
        internalType: 'uint256',
        name: 'txId',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'transactionId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'txType',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'metadata',
            type: 'string',
          },
        ],
        internalType: 'struct PredictlyCoin.Transaction',
        name: '',
        type: 'tuple',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getUserTransactions',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getUserTransactionCount',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getUserTransactionsPaginated',
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'transactionId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'txType',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'metadata',
            type: 'string',
          },
        ],
        internalType: 'struct PredictlyCoin.Transaction[]',
        name: '',
        type: 'tuple[]',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'setTreasuryWallet',
    inputs: [
      {
        internalType: 'address',
        name: 'newTreasuryWallet',
        type: 'address',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'transferTreasuryToWallet',
    inputs: [],
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getContractStats',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalSupplyAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'treasuryBalanceAmount',
        type: 'uint256',
        },
      {
        internalType: 'uint256',
        name: 'totalBets',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalTransactions',
        type: 'uint256',
      },
    ],
  },
];

// ==================== CONSTANTS ====================

export const COIN_DECIMALS = 18;
export const APP_FEE_PERCENTAGE = 5; // 5% fee on winnings
export const MIN_BET_AMOUNT = '1'; // 1 PDC minimum
export const MIN_WITHDRAWAL_AMOUNT = '1'; // 1 PDC minimum
