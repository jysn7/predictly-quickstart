"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./rootProvider";

export default function Home() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { address, isConnected, connect } = useAuth();

  useEffect(() => {
    // Animation for stats
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      stat.classList.add('glow-effect');
    });
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if Base Account is connected
    if (!isConnected) {
      try {
        await connect();
      } catch (error) {
        setError("Failed to connect Base Account. Please try again.");
        console.error("Connection error:", error);
        return;
      }
    }

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Valid email submitted:", email);
      console.log("Base Account:", address);
      
      // Navigate to dashboard or success
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to join waitlist");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <button className="close-btn" type="button">
        ✕
      </button>

      <div className="hero-section">
        {/* Left Section - Hero Content */}
        <div className="hero-content">
          <h1 className="page-title">
            <span>
              The Future of Prediction Markets
            </span>
          </h1>

          <p className="hero-subtitle">
            {isConnected ? 
              `Hey ${address?.slice(0,6)}...${address?.slice(-4)}` : 
              "Hey there"}, get ready to revolutionize your prediction game with AI-powered insights
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Predictions Made</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Live Updates</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="waitlist-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-primary"
              />
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

        {/* Right Section - Features */}
        <div className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">
                  <span></span>
                </div>
                <h3>AI-Powered Predictions</h3>
              </div>
              <p>Get accurate predictions backed by advanced machine learning algorithms</p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">
                  <span></span>
                </div>
                <h3>Global Leaderboards</h3>
              </div>
              <p>Compete with users worldwide and climb the ranks</p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">
                  <span></span>
                </div>
                <h3>Real-time Analytics</h3>
              </div>
              <p>Track your performance with detailed statistics and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
