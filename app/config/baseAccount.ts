export const baseAccountConfig = {
  appName: 'Predictly',
  networks: {
    mainnet: {
      chainID: '0x14a33', // Base Mainnet
      chainName: 'Base',
      rpcUrls: ['https://mainnet.base.org'],
      blockExplorerUrls: ['https://basescan.org'],
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    },
    testnet: {
      chainID: '0x14a34', // Base Goerli
      chainName: 'Base Goerli',
      rpcUrls: ['https://goerli.base.org'],
      blockExplorerUrls: ['https://goerli.basescan.org'],
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    }
  }
};