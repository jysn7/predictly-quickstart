"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../rootProvider';
import { getBalance } from '../utils/coinSystem';
import { Wallet, Bell, Settings as SettingsIcon, LogOut, User, Shield, Coins } from 'lucide-react';

export default function Settings() {
  const router = useRouter();
  const { address, isConnected, disconnect } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    betResults: true,
    newMatches: true,
    promotions: false,
  });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load user preferences from localStorage
    const savedUsername = localStorage.getItem('username') || '';
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    const savedNotifications = localStorage.getItem('notifications');
    
    setUsername(savedUsername);
    setTheme(savedTheme);
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    // Load balance
    if (address) {
      loadBalance();
    }
  }, [address]);

  const loadBalance = async () => {
    if (!address) return;
    try {
      const data = await getBalance(address);
      setBalance(parseFloat(data.balance));
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Validate username
      if (username.trim().length < 3) {
        alert('❌ Username must be at least 3 characters long');
        setIsSaving(false);
        return;
      }

      if (username.trim().length > 20) {
        alert('❌ Username must be less than 20 characters');
        setIsSaving(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem('username', username.trim());
      localStorage.setItem('theme', theme);
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      // Apply theme
      document.documentElement.setAttribute('data-theme', theme);
      
      // Also update display name in window for immediate effect
      window.dispatchEvent(new Event('usernameChanged'));
      
      alert('✅ Settings saved successfully! Your display name will appear on new predictions.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('❌ Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect your wallet?')) {
      disconnect();
      router.push('/');
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert('✅ Address copied to clipboard!');
    }
  };

  return (
    <main className="page-container">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="page-title" style={{ marginBottom: '2rem' }}>Settings</h1>

        {/* Wallet Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Wallet size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Wallet</h3>
          </div>
          
          {isConnected && address ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  Connected Address
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--background)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                }}>
                  <code style={{ flex: 1, fontSize: '0.9rem', color: 'var(--accent)' }}>
                    {address}
                  </code>
                  <button
                    onClick={copyAddress}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}>
                <Coins size={32} style={{ color: 'var(--accent)' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    PDC Balance
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)', margin: 0 }}>
                    {balance.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => router.push('/buy-coins')}
                  style={{
                    marginLeft: 'auto',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--accent)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Buy More
                </button>
              </div>

              <button
                onClick={handleDisconnect}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  color: '#ef4444',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <LogOut size={18} />
                Disconnect Wallet
              </button>
            </>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                No wallet connected. Connect your wallet to start betting.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <User size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Profile</h3>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Display Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '1rem',
              }}
            />
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {username.trim().length}/20 characters • This name will appear on your predictions
            </p>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Bell size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Notifications</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Control how and when you receive notifications
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(notifications).map(([key, value]) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  backgroundColor: 'var(--background)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '0.95rem', color: 'var(--text)', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--accent)',
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <SettingsIcon size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Appearance</h3>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  padding: '0.75rem',
                  backgroundColor: theme === 'dark' ? 'var(--accent)' : 'transparent',
                  border: `2px solid ${theme === 'dark' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  color: theme === 'dark' ? 'white' : 'var(--text)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                style={{
                  padding: '0.75rem',
                  backgroundColor: theme === 'light' ? 'var(--accent)' : 'transparent',
                  border: `2px solid ${theme === 'light' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  color: theme === 'light' ? 'white' : 'var(--text)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                ☀️ Light
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Shield size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Security</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Your wallet is secured by Base Account. All transactions require your approval.
          </p>
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#22c55e',
          }}>
            ✓ Wallet encryption enabled
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: isSaving ? 'var(--border)' : 'var(--accent)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </main>
  );
}
