import React, { useEffect, useState } from 'react';
import { AudioProvider, useAudio } from './hooks/useAudio';
import { NowPlaying } from './components/NowPlaying';
import { TrackList } from './components/TrackList';
import { PlaylistManager } from './components/PlaylistManager';
import { Equalizer } from './components/Equalizer';
import { Music, Heart, ListMusic, Sliders, Sun, Moon } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentView, setCurrentView, tracks, likedTracks } = useAudio();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('mp3_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // System preference fallback
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mp3_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getFavoritesCount = () => {
    return tracks.filter((t) => likedTracks.includes(t.id)).length;
  };

  return (
    <div
      className="glass-panel fade-in"
      style={{
        width: '95vw',
        maxWidth: '1000px',
        height: '90vh',
        maxHeight: '760px',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 380px) 1fr',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Left Pane: Now Playing Screen */}
      <div
        style={{
          borderRight: '1px solid var(--panel-border)',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <NowPlaying />
      </div>

      {/* Right Pane: Tabs & Lists */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          padding: '24px'
        }}
      >
        {/* Header Row: Title & Theme Switcher & Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* Logo Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/ply_logo.png"
              alt="PLY Logo"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px var(--accent-glow)',
                objectFit: 'cover'
              }}
            />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              PLY
            </h1>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid var(--panel-border)'
              }}
            >
              {[
                { id: 'library', label: 'Library', icon: Music },
                { id: 'favorites', label: `Favorites (${getFavoritesCount()})`, icon: Heart },
                { id: 'playlists', label: 'Playlists', icon: ListMusic },
                { id: 'equalizer', label: 'Equalizer', icon: Sliders }
              ].map((tab) => {
                const IconComponent = tab.icon;
                // Special check to highlight Favorites tab specifically if it matches
                const isExactActive = currentView === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id as any)}
                    style={{
                      background: isExactActive ? 'var(--accent)' : 'transparent',
                      border: 'none',
                      color: isExactActive ? 'white' : 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: isExactActive ? '0 2px 8px var(--accent-glow)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isExactActive) e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isExactActive) e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <IconComponent size={14} />
                    <span className="tab-label">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-primary)',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {currentView === 'library' && <TrackList />}
          {currentView === 'favorites' && <TrackList />}
          {currentView === 'playlists' && <PlaylistManager />}
          {currentView === 'equalizer' && <Equalizer />}
        </div>
      </div>

      {/* Embedded CSS for media query responsive styling */}
      <style>{`
        @media (max-width: 768px) {
          .glass-panel {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1.2fr 1fr !important;
            height: 98vh !important;
            max-height: none !important;
          }
          div[style*="borderRight"] {
            border-right: none !important;
            border-bottom: 1px solid var(--panel-border) !important;
          }
          .tab-label {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AudioProvider>
      <DashboardContent />
    </AudioProvider>
  );
};

export default App;
