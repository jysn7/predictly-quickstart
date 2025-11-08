"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    createBaseAccountSDK?: (config: any) => any;
    base?: any;
  }
}

export default function BaseScriptLoader() {
  useEffect(() => {
    // Initialize Base Account after script loads
    const initializeBaseAccount = () => {
      if (window.createBaseAccountSDK) {
        const sdk = window.createBaseAccountSDK({
          appName: "Predictly",
          appLogoUrl: "https://predictly.app/logo.png",
        });
        
        // Store the provider globally for use in other components
        (window as any).baseProvider = sdk.getProvider();
        (window as any).baseSDK = sdk;
        
        console.log("Base Account SDK initialized successfully");
      }
    };

    // Check if already loaded
    if (window.createBaseAccountSDK) {
      initializeBaseAccount();
    } else {
      // Wait for script to load
      window.addEventListener('load', initializeBaseAccount);
      return () => window.removeEventListener('load', initializeBaseAccount);
    }
  }, []);

  return (
    <Script
      src="https://unpkg.com/@base-org/account/dist/base-account.min.js"
      strategy="beforeInteractive"
      onError={(e) => {
        console.error('Error loading Base Account script:', e);
      }}
      onLoad={() => {
        console.log('Base Account script loaded successfully');
      }}
    />
  );
}