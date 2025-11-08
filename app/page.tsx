"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./rootProvider";
import { Trophy, TrendingUp, Zap, Users, Target, DollarSign } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { address, isConnected, connect } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Animation for stats on load
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      stat.classList.add('glow-effect');
    });
  }, []);

  const handleGetStarted = async () => {
    if (!isConnected) {
      setIsConnecting(true);
      try {
        await connect();
        router.push("/predict");
      } catch (error) {
        console.error("Connection error:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      router.push("/predict");
    }
  };

  const handleExplorePredictions = () => {
    router.push("/community-bets");
  };

  return (
    <div className="page-container">
      <div className="hero-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Content */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '0.5rem 1rem', 
            background: 'rgba(124, 58, 237, 0.1)', 
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '50px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--accent)'
          }}>
            ⚡ Built on Base • Powered by AI
          </div>

          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '800', 
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2'
          }}>
            Predict. Bet. Win.
          </h1>

          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '2.5rem',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6'
          }}>
            {isConnected ? 
              `Welcome back, ${address?.slice(0,6)}...${address?.slice(-4)}! Ready to make winning predictions?` : 
              "AI-powered sports predictions with real rewards. Join thousands of predictors earning on Base blockchain."}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleGetStarted}
              disabled={isConnecting}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isConnecting ? 'Connecting...' : isConnected ? 'Start Predicting' : 'Connect & Start'}
              <Zap size={20} />
            </button>

            <button 
              onClick={handleExplorePredictions}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text)';
              }}
            >
              Explore Predictions
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          <div className="stat-card" style={{
            padding: '2rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div className="stat-number" style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: 'var(--accent)',
              marginBottom: '0.5rem'
            }}>98%</div>
            <div className="stat-label" style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>AI Accuracy</div>
          </div>

          <div className="stat-card" style={{
            padding: '2rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div className="stat-number" style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: 'var(--accent)',
              marginBottom: '0.5rem'
            }}>50K+</div>
            <div className="stat-label" style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>Active Users</div>
          </div>

          <div className="stat-card" style={{
            padding: '2rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div className="stat-number" style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: 'var(--accent)',
              marginBottom: '0.5rem'
            }}>1M+</div>
            <div className="stat-label" style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>Predictions</div>
          </div>

          <div className="stat-card" style={{
            padding: '2rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div className="stat-number" style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: 'var(--accent)',
              marginBottom: '0.5rem'
            }}>$500K+</div>
            <div className="stat-label" style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>Total Winnings</div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ marginTop: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            textAlign: 'center',
            marginBottom: '3rem',
            color: 'var(--text)'
          }}>
            Why Choose Predictly?
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem'
          }}>
            <div className="feature-card" style={{
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(124, 58, 237, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Target size={28} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
                AI-Powered Predictions
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Get accurate predictions backed by advanced machine learning algorithms analyzing thousands of data points.
              </p>
            </div>

            <div className="feature-card" style={{
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <DollarSign size={28} color="#06b6d4" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
                Real Rewards
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Bet with PDC coins and earn real rewards. Win big with accurate predictions on Base blockchain.
              </p>
            </div>

            <div className="feature-card" style={{
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Trophy size={28} color="#22c55e" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
                Global Leaderboards
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Compete with users worldwide, climb the ranks, and earn exclusive badges and rewards.
              </p>
            </div>

            <div className="feature-card" style={{
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(251, 146, 60, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <TrendingUp size={28} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
                Real-time Analytics
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Track your performance with detailed statistics, insights, and live match updates 24/7.
              </p>
            </div>

            <div className="feature-card" style={{
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Users size={28} color="#a855f7" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
                Community Driven
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Join a thriving community of sports enthusiasts, share predictions, and learn from top predictors.
              </p>
            </div>

            <div className="feature-card" style={{
              padding: '2rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Zap size={28} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
                Lightning Fast
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Built on Base for instant transactions, low fees, and seamless betting experience.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          marginTop: '5rem',
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            color: 'var(--text)'
          }}>
            Ready to Start Winning?
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join thousands of users making accurate predictions and earning rewards on Base blockchain.
          </p>
          <button 
            onClick={handleGetStarted}
            disabled={isConnecting}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
            }}
            onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Go to Dashboard' : 'Get Started Now'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border-color: var(--accent);
        }

        @keyframes glow-effect {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .glow-effect {
          animation: glow-effect 2s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          h1 { font-size: 2.5rem !important; }
          h2 { font-size: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
