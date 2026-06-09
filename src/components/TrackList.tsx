import React, { useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import { Upload, Search, Heart, Plus, Music, Play, FolderOpen } from 'lucide-react';

export const TrackList: React.FC = () => {
  const {
    tracks,
    currentTrack,
    playbackState,
    likedTracks,
    playlists,
    searchQuery,
    currentView,
    loadTracks,
    playTrack,
    toggleLike,
    addTrackToPlaylist,
    setSearchQuery,
  } = useAudio();

  const [activePlaylistMenu, setActivePlaylistMenu] = useState<string | null>(null);

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      loadTracks(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      loadTracks(e.dataTransfer.files);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter tracks based on search query and current view
  const filteredTracks = tracks.filter((track) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query);

    if (currentView === 'favorites') {
      return matchesSearch && likedTracks.includes(track.id);
    }

    return matchesSearch;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '16px'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Search & Upload Bar */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            size={18}
            color="var(--text-secondary)"
            style={{ position: 'absolute', left: '14px' }}
          />
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--panel-border)',
              color: 'var(--text-primary)',
              padding: '10px 14px 10px 42px',
              borderRadius: '14px',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
        </div>

        {/* Upload Button */}
        <label
          htmlFor="folder-upload-input"
          style={{
            background: 'var(--accent-gradient)',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 4px 12px var(--accent-glow)',
            transition: 'transform 0.1s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FolderOpen size={16} />
          <span>Scan Folder</span>
        </label>
        <input
          id="folder-upload-input"
          type="file"
          // Custom properties cast for TS
          {...({
            webkitdirectory: '',
            directory: '',
            multiple: true
          } as any)}
          onChange={handleFolderUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Tracks Container */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tracks.length === 0 ? (
          // Drag-and-drop placeholder
          <div
            style={{
              height: '100%',
              minHeight: '220px',
              border: '2px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '24px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.08)'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Upload size={28} color="var(--accent)" />
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Import your music library
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Drag and drop a folder containing audio files here, or click "Scan Folder" to load MP3/WAV tracks.
              </p>
            </div>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            No tracks found matching your filters.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {filteredTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isLiked = likedTracks.includes(track.id);

              return (
                <div
                  key={track.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    background: isCurrent ? 'var(--active-bg)' : 'transparent',
                    border: '1px solid',
                    borderColor: isCurrent ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => playTrack(track)}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    {/* Art cover */}
                    <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Music size={18} color="var(--text-secondary)" />
                        </div>
                      )}

                      {/* Overlapping Play Icon when hovered */}
                      <div
                        className="play-overlay"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0,0,0,0.4)',
                          borderRadius: '8px',
                          display: isCurrent && playbackState === 'playing' ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        <Play size={14} fill="white" color="white" />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: isCurrent ? 'var(--accent)' : 'var(--text-primary)',
                          transition: 'color 0.2s'
                        }}
                        className="truncate-text"
                      >
                        {track.title}
                      </div>
                      <div
                        style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}
                        className="truncate-text"
                      >
                        {track.artist} • {track.album || 'Unknown Album'}
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                    onClick={(e) => e.stopPropagation()} // Stop row click triggers
                  >
                    {/* Duration */}
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        marginRight: '4px',
                        fontWeight: 500
                      }}
                    >
                      {formatDuration(track.duration)}
                    </span>

                    {/* Favorite / Heart */}
                    <button
                      onClick={() => toggleLike(track.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isLiked ? '#ec4899' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Heart size={16} fill={isLiked ? '#ec4899' : 'transparent'} />
                    </button>

                    {/* Add to Playlist button */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() =>
                          setActivePlaylistMenu(activePlaylistMenu === track.id ? null : track.id)
                        }
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Plus size={16} />
                      </button>

                      {/* Playlist Dropdown */}
                      {activePlaylistMenu === track.id && (
                        <div
                          className="glass-panel"
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: 0,
                            marginBottom: '8px',
                            width: '180px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '6px',
                            zIndex: 90,
                            boxShadow: 'var(--shadow)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-secondary)',
                              fontWeight: 600,
                              padding: '6px 8px',
                              borderBottom: '1px solid var(--panel-border)'
                            }}
                          >
                            Add to playlist:
                          </div>
                          {playlists.length === 0 ? (
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                padding: '10px 8px',
                                textAlign: 'center'
                              }}
                            >
                              Create a playlist first!
                            </div>
                          ) : (
                            playlists.map((playlist) => {
                              const alreadyIn = playlist.trackIds.includes(track.id);
                              return (
                                <button
                                  key={playlist.id}
                                  disabled={alreadyIn}
                                  onClick={() => {
                                    addTrackToPlaylist(playlist.id, track.id);
                                    setActivePlaylistMenu(null);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: alreadyIn ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    cursor: alreadyIn ? 'default' : 'pointer',
                                    fontSize: '0.8rem',
                                    textAlign: 'left',
                                    transition: 'background 0.2s ease',
                                    opacity: alreadyIn ? 0.5 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!alreadyIn) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!alreadyIn) e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  {playlist.name} {alreadyIn && '(Added)'}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default TrackList;
