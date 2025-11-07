"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          // Prioritize Base Account
          preference: "baseAccount",
        },
      }}
      baseAccount={{
        enabled: true,
        clientId: process.env.NEXT_PUBLIC_BASE_ACCOUNT_CLIENT_ID,
        callbackURL: process.env.NEXT_PUBLIC_BASE_ACCOUNT_CALLBACK_URL,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
