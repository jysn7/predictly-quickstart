"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

declare global {
  interface Window {
    createBaseAccountSDK?: (config: any) => any;
    baseProvider?: any;
    baseSDK?: any;
  }
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'not-available' | 'ready' | 'no-wallet'>('loading');

  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 20;
    const checkInterval = 300;

    const checkBaseAccount = async () => {
      if (checkCount === 0) {
        console.log("Checking Base Account SDK...");
      }
      
      if (window.baseProvider) {
        setConnectionStatus('ready');
        console.log("Base Account SDK ready");
        
        try {
          // Try to get connected accounts
          const result = await window.baseProvider.request({
            method: "eth_accounts",
            params: [],
          });
          
          if (result && result.length > 0) {
            setAccount(result[0]);
            console.log("Restored connection to:", result[0]);
          }
        } catch (error) {
          console.log("No previous connection found");
        }
      } else if (checkCount < maxChecks) {
        checkCount++;
        console.log(`Base Account SDK not ready, attempt ${checkCount}/${maxChecks}`);
        setTimeout(checkBaseAccount, checkInterval);
      } else {
        setConnectionStatus('not-available');
        console.error("Base Account SDK failed to load after multiple attempts");
      }
    };
    
    checkBaseAccount();
  }, []);

  const handleConnect = async () => {
    if (!window.baseProvider) {
      console.error("Base Account SDK not available");
      setConnectionStatus('not-available');
      return;
    }

    try {
      setIsConnecting(true);
      console.log("Initiating Base Account connection...");
      
      // Generate a fresh nonce for SIWE
      const nonce = window.crypto.randomUUID().replace(/-/g, "");
      
      // Request connection using wallet_connect
      const result = await window.baseProvider.request({
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

      if (result && result.accounts && result.accounts.length > 0) {
        const address = result.accounts[0].address;
        setAccount(address);
        console.log("Successfully connected to:", address);
      } else {
        console.warn("Connected but no accounts returned");
        setConnectionStatus('not-available');
      }
    } catch (error: any) {
      console.error("Failed to connect:", {
        error,
        message: error.message,
        code: error.code,
      });
      
      if (error.code === 4001) {
        console.log("User rejected connection request");
      } else if (error.code === -32002) {
        console.log("Connection request already pending");
      }
      
      setConnectionStatus('not-available');
    } finally {
      setIsConnecting(false);
      setOpen(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (window.baseProvider) {
        // Call wallet_disconnect if available
        try {
          await window.baseProvider.request({
            method: "wallet_disconnect",
            params: [],
          });
        } catch (error) {
          console.log("Disconnect method not available, clearing session");
        }
      }
      
      setAccount(null);
      console.log("Disconnected from Base Account");
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        className="sidebar-toggle"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        &#9776;
      </button>

      {/* Main sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo & Brand */}
        <div className="brand">
          <div style={{width:36,height:36,background:'var(--accent)',borderRadius:8}} />
          <div>
            <div style={{fontWeight:"700"}}>Predictly</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>Predict & share</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="nav">
          <Link href="/" className="nav-link" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/feed" className="nav-link" onClick={() => setOpen(false)}>Feed</Link>
          <Link href="/predict" className="nav-link" onClick={() => setOpen(false)}>Predict</Link>
          <Link href="/community-bets" className="nav-link" onClick={() => setOpen(false)}>Community</Link>
          <Link href="/leaderboard" className="nav-link" onClick={() => setOpen(false)}>Leaderboard</Link>
          <Link href="/dashboard" className="nav-link" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/settings" className="nav-link" onClick={() => setOpen(false)}>Settings</Link>
        </nav>

        {/* Connect Button */}
        <div style={{marginTop:'auto',padding:'0.5rem 0'}}>
          {connectionStatus === 'loading' ? (
            <div className="wallet-info">
              <div style={{fontSize:12,color:'var(--muted)',marginBottom:4}}>Loading Base Account...</div>
              <div className="loading-skeleton" style={{height: '2rem', width: '100%'}}></div>
            </div>
          ) : connectionStatus === 'no-wallet' ? (
            <div className="wallet-info" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)'}}>
              <div style={{fontSize:12,color:'#ef4444',marginBottom:4}}>Base Wallet Not Found</div>
              <div style={{fontSize:14,marginBottom:8}}>Please install Base Wallet to continue</div>
              <a 
                href="https://chrome.google.com/webstore/detail/base-wallet/cebjhmiijgnafdafdeleophoficghmii"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{width:'100%',display:'block',textAlign:'center',textDecoration:'none'}}
              >
                Install Base Wallet
              </a>
            </div>
          ) : connectionStatus === 'not-available' ? (
            <div className="wallet-info" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)'}}>
              <div style={{fontSize:12,color:'#ef4444',marginBottom:4}}>Base Account Not Available</div>
              <div style={{fontSize:14,marginBottom:8}}>Please refresh the page or check your connection</div>
            </div>
          ) : account ? (
            <div className="wallet-info">
              <div style={{fontSize:12,color:'var(--accent)',marginBottom:4}}>
                <span style={{display: 'inline-block', width: 8, height: 8, backgroundColor: 'var(--accent)', borderRadius: '50%', marginRight: 6}}></span>
                Connected to Base
              </div>
              <div style={{fontSize:14,marginBottom:8}}>{account.slice(0,6)}...{account.slice(-4)}</div>
              <button 
                className="btn-secondary" 
                onClick={handleDisconnect}
                style={{width:'100%'}}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleConnect}
              style={{width:'100%'}}
              disabled={isConnecting || connectionStatus !== 'ready'}
            >
              {isConnecting ? 'Connecting...' : 'Connect Base Account'}
            </button>
          )}
        </div>

        {/* Mobile close button */}
        <button
          className="close-btn"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          style={{display: open ? 'block' : 'none'}}
        >
          ✕
        </button>
      </aside>
    </>
  )
  ;
}
