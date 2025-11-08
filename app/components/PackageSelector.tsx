'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { getCoinPackages, formatUSDC } from '@/app/utils/basePay';

interface PackageSelectorProps {
  isOpen: boolean;
  onSelect: (usdAmount: string) => void;
  onClose: () => void;
}

export default function PackageSelector({ isOpen, onSelect, onClose }: PackageSelectorProps) {
  const packages = getCoinPackages();
  const [selectedAmount, setSelectedAmount] = useState<string>(packages[2].usdAmount);

  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect(selectedAmount);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999] backdrop-blur-md bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto"
          style={{
            animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000', margin: 0 }}>
              Select Package
            </h2>
            <button
              onClick={onClose}
              style={{
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
              }}
            >
              <X size={18} color="#666" />
            </button>
          </div>

          {/* Package List */}
          <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }} className="hide-scrollbar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {packages.map(pkg => (
                <label
                  key={pkg.usdAmount}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: selectedAmount === pkg.usdAmount ? '2px solid #0052FF' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedAmount === pkg.usdAmount ? '#f0f6ff' : '#fafafa',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAmount !== pkg.usdAmount) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#d0d0d0';
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAmount !== pkg.usdAmount) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5';
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#fafafa';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="package"
                    value={pkg.usdAmount}
                    checked={selectedAmount === pkg.usdAmount}
                    onChange={(e) => setSelectedAmount(e.target.value)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: '#0052FF',
                    }}
                  />
                  <div style={{ flex: 1, marginLeft: '1rem' }}>
                    <div style={{ fontWeight: '600', color: '#000', fontSize: '0.95rem' }}>
                      {pkg.coinAmount} PDC Coins
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {formatUSDC(pkg.usdAmount)}
                    </div>
                  </div>
                  {pkg.popular && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #0052FF 0%, #5c2fff 100%)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ⭐ POPULAR
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', padding: '1.5rem', borderTop: '1px solid #f0f0f0' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '6px',
                color: '#333',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#0052FF',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
