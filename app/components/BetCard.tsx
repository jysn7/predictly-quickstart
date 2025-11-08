'use client';

import { useState } from 'react';
import { MapPin, Calendar, Heart, Share2 } from 'lucide-react';

interface BetCardProps {
  bet: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
    prediction: string;
    confidence: number;
    location: string;
    matchDateTime: string;
    username: string;
    userId: string;
    timestamp: number;
    likes: number;
    likedBy: string[];
  };
  currentUserId?: string;
  onLike: (betId: string) => void;
  onShare: (bet: any) => void;
  onClick?: () => void;
}

export default function BetCard({
  bet,
  currentUserId,
  onLike,
  onShare,
  onClick,
}: BetCardProps) {
  const [isLiked, setIsLiked] = useState(
    currentUserId ? bet.likedBy.includes(currentUserId) : false
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#22c55e';
    if (confidence >= 60) return '#3b82f6';
    if (confidence >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike(bet.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(bet);
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '1rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#a78bfa';
          (e.currentTarget as HTMLDivElement).style.backgroundColor = '#222';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#333';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1a1a1a';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#a78bfa30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#a78bfa',
                flexShrink: 0,
              }}
            >
              {bet.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: '0', overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {bet.username || 'Anonymous'}
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>
                {getTimeAgo(bet.timestamp)}
              </p>
            </div>
          </div>
        </div>
        <span
          style={{
            backgroundColor: '#333',
            color: '#999',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            flexShrink: 0,
          }}
        >
          {bet.sport}
        </span>
      </div>

      {/* Match Info */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '5px', wordBreak: 'break-word' }}>
          <strong>{bet.homeTeam}</strong> vs <strong>{bet.awayTeam}</strong>
        </div>
        <div style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <MapPin size={12} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bet.location}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={12} style={{ flexShrink: 0 }} /> {bet.matchDateTime}
        </div>
      </div>

      {/* Prediction */}
      <div
        style={{
          backgroundColor: '#0f0f0f',
          border: `1px solid ${getConfidenceColor(bet.confidence)}30`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ minWidth: '0', overflow: 'hidden' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>
            Prediction
          </p>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {bet.prediction}
          </p>
        </div>
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${getConfidenceColor(bet.confidence)}20`,
            border: `2px solid ${getConfidenceColor(bet.confidence)}`,
            fontSize: '16px',
            fontWeight: 'bold',
            color: getConfidenceColor(bet.confidence),
            flexShrink: 0,
          }}
        >
          {bet.confidence}%
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
        <button
          onClick={handleLike}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            backgroundColor: isLiked ? '#a78bfa20' : 'transparent',
            border: `1px solid ${isLiked ? '#a78bfa' : '#333'}`,
            borderRadius: '6px',
            color: isLiked ? '#a78bfa' : '#999',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#a78bfa';
            (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa';
          }}
          onMouseLeave={(e) => {
            if (!isLiked) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#333';
              (e.currentTarget as HTMLButtonElement).style.color = '#999';
            }
          }}
        >
          <Heart size={14} fill={isLiked ? '#a78bfa' : 'none'} /> {bet.likes}
        </button>

        <button
          onClick={handleShare}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            backgroundColor: 'transparent',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#999',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#3b82f6';
            (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#333';
            (e.currentTarget as HTMLButtonElement).style.color = '#999';
          }}
        >
          <Share2 size={14} /> Share
        </button>
      </div>
    </div>
  );
}
