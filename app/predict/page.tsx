"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PredictionCard from "../components/PredictionCard";
import PredictionResultModal from "../components/PredictionResultModal";
import PlaceBetModal, { BetData } from "../components/PlaceBetModal";
import { buildSuggestionPrompt } from "../utils/ai";
import { callAiOrMock } from "../utils/demo";
import { getUpcomingMatches, searchMatches, formatMatchDate, getDayName, getFullMatchDateTime, getSports, type Match } from "../utils/sports";
import { getEnhancedMatchData, generateStatisticalPrediction } from "../utils/sportsdb";
import { getBalance, placeBet as placeBetAPI } from "../utils/coinSystem";
import { Coins } from "lucide-react";

export default function Predict() {
  const router = useRouter();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [sports, setSports] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);
  const [betMatch, setBetMatch] = useState<Match | null>(null);
  const [savedBets, setSavedBets] = useState<any[]>([]);
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [userWalletAddress, setUserWalletAddress] = useState<string>("0x0");

  // Get userId from wallet address
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Try to get wallet address first, fallback to generated ID
    const walletAddress = localStorage.getItem('base_account_address');
    const storedUserId = walletAddress || localStorage.getItem('userId');
    
    if (!storedUserId) {
      const newUserId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    } else {
      setUserId(storedUserId);
    }
  }, []);

  // Handler to navigate to buy coins page
  const handleBuyCoins = () => {
    router.push('/buy-coins');
  };

  // Load matches on mount
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const matches = await getUpcomingMatches();
        setAllMatches(matches);
        setFilteredMatches(matches);
        setSports(['All Sports', ...getSports()]);
      } catch (error) {
        console.error('Failed to load matches:', error);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    loadMatches();
  }, []);

  // Load balance and get wallet address
  useEffect(() => {
    const loadBalance = async () => {
      try {
        // Get wallet address from localStorage or use placeholder
        const storedAddress = localStorage.getItem('userWalletAddress') || userWalletAddress;
        setUserWalletAddress(storedAddress);

        // Load coin balance
        if (storedAddress && storedAddress !== '0x0') {
          const balance = await getBalance(storedAddress);
          setCoinBalance(parseFloat(balance.balance));
        }
      } catch (error) {
        console.error('Failed to load balance:', error);
      }
    };

    loadBalance();
    const interval = setInterval(loadBalance, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Update filtered matches when search or sport changes
  useEffect(() => {
    const sport = selectedSport === 'All Sports' ? undefined : selectedSport;
    const filtered = searchMatches(allMatches, searchQuery, sport);
    setFilteredMatches(filtered);
  }, [searchQuery, selectedSport, allMatches]);

  const handlePredict = async () => {
    if (!selectedMatch) return;
    setIsLoading(true);
    try {
      // Fetch enhanced data from TheSportsDB
      const enhancedData = await getEnhancedMatchData(
        selectedMatch.homeTeam,
        selectedMatch.awayTeam,
        selectedMatch.league
      );

      // Update selected match with stats
      const updatedMatch = { ...selectedMatch, ...enhancedData };
      setSelectedMatch(updatedMatch);

      // Get statistical prediction with reasoning
      const { prediction: statPrediction, reasoning: statReasoning } = 
        await generateStatisticalPrediction(selectedMatch.homeTeam, selectedMatch.awayTeam);

      // Prepare team stats for AI context
      const teamStats = {
        homeTeam: selectedMatch.homeTeam,
        awayTeam: selectedMatch.awayTeam,
        homeWinPercentage: enhancedData.homeTeamStats?.winPercentage || 50,
        awayWinPercentage: enhancedData.awayTeamStats?.winPercentage || 50,
        homeWins: enhancedData.homeTeamStats?.wins || 0,
        homeLosses: enhancedData.homeTeamStats?.losses || 0,
        homeDraws: enhancedData.homeTeamStats?.draws || 0,
        homeRecentForm: enhancedData.homeTeamStats?.recentForm || [],
        awayWins: enhancedData.awayTeamStats?.wins || 0,
        awayLosses: enhancedData.awayTeamStats?.losses || 0,
        awayDraws: enhancedData.awayTeamStats?.draws || 0,
        awayRecentForm: enhancedData.awayTeamStats?.recentForm || [],
      };

      // Call AI with team stats context
      const prompt = buildSuggestionPrompt(
        selectedMatch.homeTeam,
        selectedMatch.awayTeam,
        selectedMatch.sport
      );
      const data = await callAiOrMock({ prompt, max_tokens: 200, teamStats });
      const text = (data.text || '');
      const winnerMatch = text.match(/winner:\s*(\w[\w\s&.-]+)/i);
      const confidenceMatch = text.match(/(\d{1,3})%/);
      
      // Use statistical reasoning as fallback
      const reasoning = text.split('\n')[0] || statReasoning || 'AI analysis completed';
      const winner = winnerMatch ? winnerMatch[1].trim() : statPrediction;
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : 65;
      
      setResult({ 
        prediction: winner,
        confidence,
        reasoning,
        teamStats: enhancedData,
      });
      setShowModal(true);
    } catch (err) {
      console.error('Prediction error:', err);
      // Fallback to basic prediction
      setResult({ 
        prediction: "N/A", 
        confidence: 0, 
        reasoning: "Error analyzing match statistics. Please try again." 
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBet = async (betData: any) => {
    setSavedBets([...savedBets, betData]);
    // Store in localStorage for persistence
    localStorage.setItem('savedBets', JSON.stringify([...savedBets, betData]));
  };

  const handleShare = (shareUrl: string) => {
    console.log('Share URL:', shareUrl);
    // Could show a toast notification here
  };

  const handleOpenBetModal = (match: Match) => {
    setBetMatch(match);
    setShowBetModal(true);
  };

  const handlePlaceBet = async (betData: BetData) => {
    try {
      console.log('🎯 Placing bet...', betData);
      
      // Call the API to place bet on-chain
      const result = await placeBetAPI(
        userWalletAddress,
        betData.matchId,
        betData.amount,
        betData.prediction
      );

      console.log('✅ Bet placed successfully:', result);
      
      // Refresh balance
      const balance = await getBalance(userWalletAddress);
      setCoinBalance(parseFloat(balance.balance));

      // Save bet locally
      const newBet = {
        ...betData,
        betId: result.betId,
        transactionHash: result.transactionHash,
        timestamp: Date.now(),
        status: result.status,
      };
      setSavedBets([...savedBets, newBet]);
      localStorage.setItem('savedBets', JSON.stringify([...savedBets, newBet]));

      alert('✅ Bet placed successfully!');
    } catch (error) {
      console.error('❌ Error placing bet:', error);
      throw error;
    }
  };

  return (
    <main className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Upcoming Matches</h1>
        <button
          onClick={handleBuyCoins}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          <Coins size={18} />
          <span>{coinBalance.toFixed(0)}</span>
          <span>Buy Coins</span>
        </button>
      </div>

      {selectedMatch && result && (
        <PredictionResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          match={{
            id: selectedMatch.id,
            homeTeam: selectedMatch.homeTeam,
            awayTeam: selectedMatch.awayTeam,
            sport: selectedMatch.sport,
            time: selectedMatch.time,
            date: selectedMatch.date,
            location: selectedMatch.location,
            league: selectedMatch.league,
          }}
          prediction={result}
          userId={userId}
          onSaveBet={handleSaveBet}
          onShare={handleShare}
        />
      )}

      {betMatch && (
        <PlaceBetModal
          isOpen={showBetModal}
          onClose={() => setShowBetModal(false)}
          match={betMatch}
          userBalance={coinBalance}
          onPlaceBet={handlePlaceBet}
        />
      )}

      <div className="predict-layout" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '1.5rem' }}>
        {/* Main Content - Scrollable */}
        <section className="predict-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Search and Filter Section - Fixed */}
          <div className="predict-form card" style={{ flexShrink: 0 }}>
            <div className="predict-form-inputs">
              <input 
                className="input-primary" 
                placeholder="Search teams, leagues, locations, or days (e.g., 'Manchester', 'Monday', 'Old Trafford')..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select 
                className="select-input" 
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                style={{ width: '140px' }}
              >
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Matches List - Scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="hide-scrollbar">
            {isLoadingMatches ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Loading matches...
              </div>
            ) : filteredMatches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredMatches.map((match) => (
                  <div 
                    key={match.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedMatch?.id === match.id ? 'rgba(124, 58, 237, 0.1)' : 'var(--surface)',
                      borderColor: selectedMatch?.id === match.id ? 'var(--accent)' : 'var(--border)',
                      transition: 'all 0.2s',
                      padding: '1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }} onClick={() => setSelectedMatch(match)}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.75rem' }}>
                          {match.homeTeam} vs {match.awayTeam}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <div>
                            <span style={{ fontWeight: '500', color: 'var(--text)' }}>{match.league}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span>{match.sport}</span>
                          </div>
                          <div>📅 {getFullMatchDateTime(match.date, match.time)}</div>
                          <div>📍 {match.location}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div 
                          onClick={() => setSelectedMatch(match)}
                          style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '600', backgroundColor: 'rgba(124, 58, 237, 0.15)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', cursor: 'pointer' }}
                        >
                          {selectedMatch?.id === match.id ? '✓ Selected' : 'Analyze'}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBetModal(match);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
                        >
                          💰 Place Bet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No matches found. Try adjusting your search.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar - Fixed */}
        <aside className="predict-sidebar hide-scrollbar" style={{ width: '300px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          <div className="card">
            <h3 className="sidebar-title">Generate Prediction</h3>
            {selectedMatch ? (
              <>
                <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                    📌 Selected Match
                  </div>
                  <div>{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {getFullMatchDateTime(selectedMatch.date, selectedMatch.time)}
                  </div>
                </div>
                <button 
                  onClick={handlePredict} 
                  className="btn-primary"
                  disabled={isLoading}
                  style={{ width: '100%' }}
                >
                  {isLoading ? '⏳ Generating...' : '✨ Get AI Prediction'}
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Select a match to get an AI-powered prediction with confidence score.
              </p>
            )}
          </div>

          <div className="card">
            <h3 className="sidebar-title">Statistics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Matches:</span>
                <strong style={{ color: 'var(--text)' }}>{allMatches.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Filtered:</span>
                <strong style={{ color: 'var(--text)' }}>{filteredMatches.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sports:</span>
                <strong style={{ color: 'var(--text)' }}>{sports.length - 1}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span>Saved Predictions:</span>
                <strong style={{ color: 'var(--accent)' }}>{savedBets.length}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="sidebar-title">Search Tips</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li>Team names: "Manchester"</li>
              <li>Leagues: "Premier League"</li>
              <li>Locations: "Old Trafford"</li>
              <li>Days: "Monday" or "Friday"</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
