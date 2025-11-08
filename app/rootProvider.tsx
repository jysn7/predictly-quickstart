"use client";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { createBaseAccountSDK } from "@base-org/account";

interface AuthContextType {
  provider: any;
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<{ address: string; message: string; signature: string }>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType>({
  provider: null,
  address: null,
  isConnected: false,
  isLoading: true,
  connect: async () => ({ address: "", message: "", signature: "" }),
  disconnect: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function RootProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeProvider();
  }, []);

  const initializeProvider = async () => {
    try {
      const sdk = createBaseAccountSDK({ appName: "Predictly" });
      const baseProvider = sdk.getProvider();
      setProvider(baseProvider);

      // Check if already connected
      if (typeof window !== "undefined") {
        const storedAddress = localStorage.getItem("base_account_address");
        if (storedAddress) {
          setAddress(storedAddress);
          // Also sync to userWalletAddress for coin system
          localStorage.setItem("userWalletAddress", storedAddress);
        }
      }
    } catch (error) {
      console.error("Failed to initialize Base Account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    try {
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      // Generate nonce
      const nonce = window.crypto.randomUUID().replace(/-/g, "");

      // Switch to Base Chain
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }], // Base Mainnet
      });

      // Connect and authenticate
      const { accounts } = await provider.request({
        method: "wallet_connect",
        params: [
          {
            version: "1",
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: "0x2105", // Base Mainnet - 8453
              },
            },
          },
        ],
      });

      const { address: userAddress } = accounts[0];
      const { message, signature } = accounts[0].capabilities.signInWithEthereum;

      setAddress(userAddress);
      if (typeof window !== "undefined") {
        localStorage.setItem("base_account_address", userAddress);
        // Sync to userWalletAddress for coin system
        localStorage.setItem("userWalletAddress", userAddress);
      }

      // Verify with backend
      await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: userAddress, message, signature }),
      });

      return { address: userAddress, message, signature };
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("base_account_address");
      localStorage.removeItem("userWalletAddress");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        provider,
        address,
        isConnected: !!address,
        isLoading,
        connect,
        disconnect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
