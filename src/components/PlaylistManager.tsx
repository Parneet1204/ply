import React, { useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import { Play, Trash2, Plus, ListMusic, Music, ChevronRight } from 'lucide-react';
import type { Track } from '../types';

export const PlaylistManager: React.FC = () => {
  const {
    playlists,
    tracks,
    createPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    playTrack
  } = useAudio();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  
  // Resolve Track objects from trackIds
  const playlistTracks: Track[] = selectedPlaylist
    ? selectedPlaylist.trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is Track => !!t)
    : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '20px'
      }}
    >
      {/* Create Playlist Form */}
      <form
        onSubmit={handleCreate}
        style={{
          display: 'flex',
          gap: '8px'
        }}
      >
        <input
          type="text"
          placeholder="New playlist name..."
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-primary)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        />
        <button
          type="submit"
          style={{
            background: 'var(--accent-gradient)',
            border: 'none',
            color: 'white',
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px var(--accent-glow)',
            transition: 'transform 0.1s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Split view: Playlists on left/top, Playlist Tracks on right/bottom */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          flex: 1,
          minHeight: 0
        }}
      >
        {/* Playlists list */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.15)',
            borderRadius: '16px',
            padding: '12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              padding: '0 6px 6px'
            }}
          >
            PLAYLISTS
          </div>

          {playlists.length === 0 ? (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                padding: '30px 10px',
                lineHeight: 1.4
              }}
            >
              No playlists yet. Create one above!
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => setSelectedPlaylistId(playlist.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: selectedPlaylistId === playlist.id ? 'var(--active-bg)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedPlaylistId !== playlist.id) {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPlaylistId !== playlist.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <ListMusic size={18} color="var(--accent)" />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)'
                      }}
                      className="truncate-text"
                    >
                      {playlist.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {playlist.trackIds.length} tracks
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                      if (selectedPlaylistId === playlist.id) {
                        setSelectedPlaylistId(null);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      padding: '4px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} color="var(--text-secondary)" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tracks in Selected Playlist */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.15)',
            borderRadius: '16px',
            padding: '12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              padding: '0 6px 6px'
            }}
          >
            TRACKS IN {selectedPlaylist ? selectedPlaylist.name.toUpperCase() : 'SELECT PLAYLIST'}
          </div>

          {!selectedPlaylistId ? (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                padding: '40px 10px'
              }}
            >
              Select a playlist from the left to view tracks.
            </div>
          ) : playlistTracks.length === 0 ? (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                padding: '40px 10px',
                lineHeight: 1.4
              }}
            >
              Empty playlist. Add songs from your Library!
            </div>
          ) : (
            playlistTracks.map((track) => (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Music size={14} color="var(--text-secondary)" />
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}
                      className="truncate-text"
                    >
                      {track.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }} className="truncate-text">
                      {track.artist}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => playTrack(track)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      padding: '4px',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Play size={14} fill="var(--accent)" />
                  </button>
                  <button
                    onClick={() => removeTrackFromPlaylist(selectedPlaylistId, track.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      padding: '4px',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default PlaylistManager;
