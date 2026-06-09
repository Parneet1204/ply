import React from 'react';
import { useAudio } from '../hooks/useAudio';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Sliders,
  Music
} from 'lucide-react';
import { SleepTimer } from './SleepTimer';
import { AudioVisualizer } from './AudioVisualizer';

export const NowPlaying: React.FC = () => {
  const {
    currentTrack,
    playbackState,
    currentTime,
    duration,
    volume,
    likedTracks,
    repeatMode,
    isShuffled,
    seekTo,
    changeVolume,
    togglePlay,
    stopTrack,
    toggleLike,
    setRepeat,
    toggleShuffle,
    nextTrack,
    prevTrack,
    setCurrentView,
    queue
  } = useAudio();

  const isLiked = currentTrack ? likedTracks.includes(currentTrack.id) : false;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    changeVolume(volume > 0 ? 0 : 0.8);
  };

  const handleRepeatClick = () => {
    if (repeatMode === 'off') setRepeat('all');
    else if (repeatMode === 'all') setRepeat('one');
    else setRepeat('off');
  };

  const getRepeatTitle = () => {
    if (repeatMode === 'all') return 'Repeat All';
    if (repeatMode === 'one') return 'Repeat One';
    return 'Repeat Off';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic blurred album art background */}
      {currentTrack?.coverUrl && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${currentTrack.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(50px) brightness(0.2)',
            zIndex: -1,
            transition: 'background-image 0.5s ease-out',
            transform: 'scale(1.2)'
          }}
        />
      )}

      {/* Top row: Sleep Timer & Equalizer Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <SleepTimer />

        <button
          onClick={() => setCurrentView('equalizer')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-primary)',
            padding: '8px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
        >
          <Sliders size={16} />
          <span>EQ Panel</span>
        </button>
      </div>

      {/* Vinyl record spinning disc */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%',
          maxHeight: '340px',
          zIndex: 10
        }}
      >
        <div
          className={`vinyl-disc ${playbackState === 'playing' ? 'spinning-art' : 'spinning-art paused-art'}`}
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #2a2a2a 40%, #151515 50%, #050505 70%, #000 100%)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.8)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid rgba(255, 255, 255, 0.03)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Vinyl groove texture overlay */}
          <div
            style={{
              position: 'absolute',
              width: '92%',
              height: '92%',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.02)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '84%',
              height: '84%',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.015)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '76%',
              height: '76%',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.015)',
              pointerEvents: 'none'
            }}
          />

          {/* Central album cover label */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              background: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
            }}
          >
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Music size={44} color="var(--text-secondary)" />
            )}
          </div>

          {/* Center spindle hole */}
          <div
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--bg-gradient)',
              border: '3px solid rgba(255, 255, 255, 0.08)',
              zIndex: 10,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)'
            }}
          />
        </div>
      </div>

      {/* Middle Panel: Song info */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          marginBottom: '20px',
          zIndex: 10
        }}
      >
        {currentTrack ? (
          <>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}
              className="truncate-text"
            >
              {currentTrack.title}
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}
              className="truncate-text"
            >
              {currentTrack.artist}
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No song loaded
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Scan local folders and choose a track
            </p>
          </>
        )}
      </div>

      {/* Progress & Seekbar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '20px',
          zIndex: 10
        }}
      >
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={!currentTrack}
          style={{ width: '100%' }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary playback control row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          width: '100%',
          marginBottom: '24px',
          zIndex: 10
        }}
      >
        {/* Shuffle toggler */}
        <button
          onClick={toggleShuffle}
          disabled={queue.length <= 1}
          style={{
            background: 'transparent',
            border: 'none',
            color: isShuffled ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: queue.length <= 1 ? 'default' : 'pointer',
            opacity: queue.length <= 1 ? 0.3 : 1,
            transition: 'color 0.2s ease'
          }}
          title="Shuffle"
        >
          <Shuffle size={18} />
        </button>

        {/* Previous */}
        <button
          onClick={prevTrack}
          disabled={queue.length === 0}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: queue.length === 0 ? 'default' : 'pointer',
            opacity: queue.length === 0 ? 0.3 : 1
          }}
        >
          <SkipBack size={24} fill="currentColor" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!currentTrack && queue.length === 0}
          style={{
            background: 'var(--accent-gradient)',
            border: 'none',
            color: 'white',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!currentTrack && queue.length === 0) ? 'default' : 'pointer',
            opacity: (!currentTrack && queue.length === 0) ? 0.5 : 1,
            boxShadow: '0 6px 20px var(--accent-glow)',
            transform: 'scale(1)',
            transition: 'transform 0.1s ease'
          }}
          onMouseDown={(e) => {
            if (currentTrack || queue.length > 0) e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            if (currentTrack || queue.length > 0) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {playbackState === 'playing' ? (
            <Pause size={24} fill="white" color="white" />
          ) : (
            <Play size={24} fill="white" color="white" style={{ marginLeft: '4px' }} />
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          disabled={queue.length === 0}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: queue.length === 0 ? 'default' : 'pointer',
            opacity: queue.length === 0 ? 0.3 : 1
          }}
        >
          <SkipForward size={24} fill="currentColor" />
        </button>

        {/* Repeat Toggler */}
        <button
          onClick={handleRepeatClick}
          style={{
            background: 'transparent',
            border: 'none',
            color: repeatMode !== 'off' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          title={getRepeatTitle()}
        >
          <Repeat size={18} />
          {repeatMode === 'one' && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                fontSize: '0.55rem',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '50%',
                width: '10px',
                height: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              1
            </span>
          )}
        </button>
      </div>

      {/* Bottom Row: Volume slider & Favorites button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: '16px',
          padding: '0 10px',
          zIndex: 10
        }}
      >
        {/* Liked heart */}
        <button
          onClick={() => currentTrack && toggleLike(currentTrack.id)}
          disabled={!currentTrack}
          style={{
            background: 'transparent',
            border: 'none',
            color: isLiked ? '#ec4899' : 'var(--text-secondary)',
            cursor: currentTrack ? 'pointer' : 'default',
            opacity: currentTrack ? 1 : 0.3
          }}
        >
          <Heart size={20} fill={isLiked ? '#ec4899' : 'transparent'} />
        </button>

        {/* Volume controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '160px' }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{ flex: 1, height: '4px' }}
          />
        </div>

        {/* Stop button */}
        <button
          onClick={stopTrack}
          disabled={!currentTrack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: currentTrack ? 'pointer' : 'default',
            opacity: currentTrack ? 1 : 0.3
          }}
          title="Stop Track"
        >
          <Square size={16} fill="currentColor" />
        </button>
      </div>

      {/* Bottom overlay audio visualizer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '45px',
          zIndex: 1,
          opacity: 0.8
        }}
      >
        <AudioVisualizer playbackState={playbackState} />
      </div>
    </div>
  );
};
export default NowPlaying;
