import React, { useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import { Clock } from 'lucide-react';

export const SleepTimer: React.FC = () => {
  const { sleepTimerMinutes, sleepTimerRemaining, setSleepTimer } = useAudio();
  const [isOpen, setIsOpen] = useState(false);

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectOption = (minutes: number | null) => {
    setSleepTimer(minutes);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: sleepTimerRemaining ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--panel-border)',
          color: 'var(--text-primary)',
          padding: '8px 14px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          boxShadow: sleepTimerRemaining ? '0 0 10px var(--accent-glow)' : 'none'
        }}
        title="Sleep Timer"
      >
        <Clock size={16} />
        <span>
          {sleepTimerRemaining ? formatRemaining(sleepTimerRemaining) : 'Sleep Timer'}
        </span>
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '8px',
            width: '160px',
            padding: '8px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div
            style={{
              padding: '6px 8px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              borderBottom: '1px solid var(--panel-border)',
              marginBottom: '4px'
            }}
          >
            Stop music after:
          </div>
          {[15, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => selectOption(mins)}
              style={{
                background: sleepTimerMinutes === mins ? 'var(--active-bg)' : 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '8px',
                textAlign: 'left',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sleepTimerMinutes === mins ? 'var(--active-bg)' : 'transparent')}
            >
              {mins} minutes
            </button>
          ))}
          {sleepTimerRemaining && (
            <button
              onClick={() => selectOption(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444', // red
                padding: '8px',
                textAlign: 'left',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'background 0.2s ease',
                marginTop: '4px',
                borderTop: '1px solid var(--panel-border)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Turn Off Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default SleepTimer;
