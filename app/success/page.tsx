"use client";

import { useRouter } from "next/navigation";

export default function Success() {
  const router = useRouter();
  
  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <button onClick={() => router.push('/')} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.5rem', cursor: 'pointer' }}>
        ✕
      </button>
      
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text)', marginBottom: '1rem' }}>Welcome to Predictly!</h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            You&apos;ve successfully joined. Get ready to start making predictions and earning rewards.
          </p>

          <button onClick={handleContinue} className="btn-primary" style={{ width: '100%' }}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}