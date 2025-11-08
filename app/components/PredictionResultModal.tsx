'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface PredictionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
    time: string;
    date: string;
    location: string;
    league: string;
  };
  prediction: {
    prediction: string;
    confidence: number;
    reasoning: string;
    teamStats?: any;
  };
  userId: string;
  onSaveBet: (betData: any) => Promise<void>;
  onShare: (shareUrl: string) => void;
}

export default function PredictionResultModal({
  isOpen,
  onClose,
  match,
  prediction,
  userId,
  onSaveBet,
  onShare,
}: PredictionResultModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get username from localStorage
      const username = localStorage.getItem('username') || `User_${userId.substring(0, 6)}`;
      
      const betData = {
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        sport: match.sport,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        location: match.location,
        matchDateTime: `${match.date} at ${match.time}`,
        userId: userId,
        username: username,
      };

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });

      const data = await response.json();
      if (data.success) {
        setShareUrl(data.shareUrl);
        setIsSaved(true);
        await onSaveBet(data.bet);
      }
    } catch (error) {
      console.error('Error saving bet:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}${shareUrl}`;
    navigator.clipboard.writeText(url);
    onShare(url);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#22c55e'; // green
    if (confidence >= 60) return '#3b82f6'; // blue
    if (confidence >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getDayName = () => {
    const date = new Date(`${match.date}T${match.time}`);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid #333',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#fff' }}>
            Prediction Generated ✨
          </h1>
          <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
            {getDayName()} • {match.time}
          </p>
        </div>

        {/* Match Info */}
        <div
          style={{
            backgroundColor: '#0f0f0f',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '25px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#999' }}>
              {match.league}
            </p>
            <div style={{ fontSize: '16px', color: '#fff', fontWeight: '500' }}>
              <span>{match.homeTeam}</span>
              <span style={{ margin: '0 15px', color: '#666' }}>vs</span>
              <span>{match.awayTeam}</span>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
              📍 {match.location}
            </p>
          </div>
        </div>

        {/* Prediction Result */}
        <div
          style={{
            backgroundColor: '#0f0f0f',
            padding: '25px',
            borderRadius: '8px',
            marginBottom: '25px',
            border: `2px solid ${getConfidenceColor(prediction.confidence)}`,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
              AI Prediction
            </p>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '32px', color: '#a78bfa' }}>
              {prediction.prediction}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${getConfidenceColor(prediction.confidence)}20`,
                  border: `2px solid ${getConfidenceColor(prediction.confidence)}`,
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: getConfidenceColor(prediction.confidence),
                }}
              >
                {prediction.confidence}%
              </div>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
              Confidence Score
            </p>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
              Reasoning
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
              {prediction.reasoning}
            </p>
          </div>
        </div>

        {/* Team Stats Section */}
        {prediction.teamStats && (prediction.teamStats.homeTeamStats || prediction.teamStats.awayTeamStats) && (
          <div
            style={{
              backgroundColor: '#0f0f0f',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '25px',
              border: '1px solid #333',
            }}
          >
            <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '600' }}>
              📊 Team Statistics
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Home Team Stats */}
              {prediction.teamStats.homeTeamStats && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#a78bfa', fontWeight: '600' }}>
                    {match.homeTeam}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#999' }}>Win Rate:</span>
                      <strong>{prediction.teamStats.homeTeamStats.winPercentage}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#999' }}>Record:</span>
                      <strong>
                        {prediction.teamStats.homeTeamStats.wins}W-{prediction.teamStats.homeTeamStats.losses}L-{prediction.teamStats.homeTeamStats.draws}D
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>Form:</span>
                      <strong style={{ letterSpacing: '4px' }}>
                        {prediction.teamStats.homeTeamStats.recentForm?.join('-') || 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Away Team Stats */}
              {prediction.teamStats.awayTeamStats && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>
                    {match.awayTeam}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#999' }}>Win Rate:</span>
                      <strong>{prediction.teamStats.awayTeamStats.winPercentage}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#999' }}>Record:</span>
                      <strong>
                        {prediction.teamStats.awayTeamStats.wins}W-{prediction.teamStats.awayTeamStats.losses}L-{prediction.teamStats.awayTeamStats.draws}D
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999' }}>Form:</span>
                      <strong style={{ letterSpacing: '4px' }}>
                        {prediction.teamStats.awayTeamStats.recentForm?.join('-') || 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving || isSaved}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: isSaved ? '#666' : '#a78bfa',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSaving || isSaved ? 'not-allowed' : 'pointer',
              opacity: isSaving || isSaved ? 0.6 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isSaving ? 'Saving...' : isSaved ? '✓ Saved to Profile' : 'Save to Profile'}
          </button>

          {isSaved && (
            <button
              onClick={handleShare}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
              }}
            >
              📤 Share Prediction
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#444';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#333';
          }}
        >
          Close
        </button>

        {shareUrl && (
          <div
            style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#22c55e20',
              border: '1px solid #22c55e',
              borderRadius: '6px',
              color: '#22c55e',
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            ✓ Share link copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}
