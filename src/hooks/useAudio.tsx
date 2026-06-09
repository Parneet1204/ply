import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Track, Playlist, EqualizerBand, PlaybackState, RepeatMode } from '../types';
import audioService from '../services/audioService';
import { parseMetadata } from '../utils/metadataParser';

interface AudioContextProps {
  tracks: Track[];
  currentTrack: Track | null;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  likedTracks: string[];
  playlists: Playlist[];
  queue: Track[];
  repeatMode: RepeatMode;
  isShuffled: boolean;
  equalizerBands: EqualizerBand[];
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null; // in seconds
  searchQuery: string;
  currentView: 'library' | 'favorites' | 'playlists' | 'equalizer';
  
  loadTracks: (files: FileList | File[]) => Promise<void>;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  stopTrack: () => void;
  seekTo: (seconds: number) => void;
  changeVolume: (vol: number) => void;
  toggleLike: (trackId: string) => void;
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  setRepeat: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  changeEqGain: (bandIdx: number, gain: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setSearchQuery: (query: string) => void;
  setCurrentView: (view: 'library' | 'favorites' | 'playlists' | 'equalizer') => void;
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined);

// Initial 5-band EQ state
const initialEqBands: EqualizerBand[] = [
  { frequency: 60, gain: 0 },
  { frequency: 230, gain: 0 },
  { frequency: 910, gain: 0 },
  { frequency: 4000, gain: 0 },
  { frequency: 14000, gain: 0 },
];

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('mp3_volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [likedTracks, setLikedTracks] = useState<string[]>(() => {
    const saved = localStorage.getItem('mp3_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('mp3_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [queue, setQueue] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState(false);
  const [equalizerBands, setEqualizerBands] = useState<EqualizerBand[]>(() => {
    const saved = localStorage.getItem('mp3_equalizer');
    return saved ? JSON.parse(saved) : initialEqBands;
  });
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'library' | 'favorites' | 'playlists' | 'equalizer'>('library');

  // Timer Ref for clearInterval
  const timerIntervalRef = useRef<any | null>(null);
  // Ref to store current volume for sleep fade-out math
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Sync state with audioService events
  useEffect(() => {
    audioService.onTimeUpdate((current, dur) => {
      setCurrentTime(current);
      setDuration(dur);
    });

    audioService.onStateChange((state) => {
      setPlaybackState(state);
    });

    audioService.onEnded(() => {
      handleTrackEnded();
    });

    // Load initial volume
    audioService.setVolume(volume);

    // Apply saved EQ bands
    equalizerBands.forEach((band, idx) => {
      audioService.setEqGain(idx, band.gain);
    });

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [equalizerBands]);

  // Handle media session controls mapping (macOS media keys / menu items)
  useEffect(() => {
    audioService.setMediaSessionHandlers({
      onPlay: () => resumeTrack(),
      onPause: () => pauseTrack(),
      onNext: () => nextTrack(),
      onPrev: () => prevTrack(),
    });
  }, [queue, currentTrack, playbackState]);

  // Auto-sync lists to localStorage
  useEffect(() => {
    localStorage.setItem('mp3_favorites', JSON.stringify(likedTracks));
  }, [likedTracks]);

  useEffect(() => {
    localStorage.setItem('mp3_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('mp3_equalizer', JSON.stringify(equalizerBands));
  }, [equalizerBands]);

  // Load local files and parse metadata
  const loadTracks = async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    const parsedTracks: Track[] = [];

    // Parse files asynchronously in batches or parallel
    await Promise.all(
      filesArray.map(async (file) => {
        const type = file.type || '';
        const name = file.name.toLowerCase();
        
        // Accept only mp3 and wav
        if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav')) {
          const parsed = await parseMetadata(file);
          const trackId = crypto.randomUUID();
          
          parsedTracks.push({
            ...parsed,
            id: trackId,
          });
        }
      })
    );

    if (parsedTracks.length > 0) {
      setTracks((prev) => {
        const updated = [...prev, ...parsedTracks];
        // If nothing was playing, set queue
        if (updated.length === parsedTracks.length) {
          setQueue(updated);
          setOriginalQueue(updated);
        }
        return updated;
      });
    }
  };

  const playTrack = (track: Track) => {
    // Set current track and start playing
    setCurrentTrack(track);
    audioService.playTrack(track);

    // Ensure track is in queue. If not, append it.
    if (!queue.some((t) => t.id === track.id)) {
      setQueue((prev) => [...prev, track]);
      setOriginalQueue((prev) => [...prev, track]);
    }
  };

  const pauseTrack = () => {
    audioService.pause();
  };

  const resumeTrack = () => {
    if (currentTrack) {
      audioService.resume();
    } else if (queue.length > 0) {
      playTrack(queue[0]);
    }
  };

  const togglePlay = () => {
    if (playbackState === 'playing') {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const stopTrack = () => {
    audioService.stop();
    setCurrentTime(0);
  };

  const seekTo = (seconds: number) => {
    audioService.seek(seconds);
    setCurrentTime(seconds);
  };

  const changeVolume = (vol: number) => {
    setVolume(vol);
    audioService.setVolume(vol);
    localStorage.setItem('mp3_volume', vol.toString());
  };

  const toggleLike = (trackId: string) => {
    setLikedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      trackIds: [],
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
        }
        return p;
      })
    );
  };

  const setRepeat = (mode: RepeatMode) => {
    setRepeatMode(mode);
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => {
      const nextShuffle = !prev;
      if (nextShuffle) {
        // Shuffle everything, but keep current track first if playing
        let rest = [...originalQueue];
        let first: Track[] = [];
        if (currentTrack) {
          first = [currentTrack];
          rest = rest.filter((t) => t.id !== currentTrack.id);
        }
        
        // Fisher-Yates shuffle algorithm
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        setQueue([...first, ...rest]);
      } else {
        setQueue(originalQueue);
      }
      return nextShuffle;
    });
  };

  const changeEqGain = (bandIdx: number, gain: number) => {
    setEqualizerBands((prev) => {
      const updated = [...prev];
      updated[bandIdx] = { ...updated[bandIdx], gain };
      audioService.setEqGain(bandIdx, gain);
      return updated;
    });
  };

  // Sleep Timer countdown
  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (minutes === null) {
      setSleepTimerRemaining(null);
      audioService.setVolume(volumeRef.current); // Restore volume
      return;
    }

    let remainingSeconds = minutes * 60;
    setSleepTimerRemaining(remainingSeconds);

    timerIntervalRef.current = setInterval(() => {
      remainingSeconds--;
      setSleepTimerRemaining(remainingSeconds);

      // Fade out in the last 5 seconds
      if (remainingSeconds <= 5 && remainingSeconds > 0) {
        const factor = remainingSeconds / 5; // scales from 1.0 to 0.0
        audioService.setVolume(volumeRef.current * factor);
      }

      if (remainingSeconds <= 0) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        audioService.stop();
        audioService.setVolume(volumeRef.current); // Reset volume state
        setSleepTimerMinutes(null);
        setSleepTimerRemaining(null);
      }
    }, 1000);
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    if (repeatMode === 'one' && currentTrack) {
      // Replay current song
      playTrack(currentTrack);
      return;
    }

    const currentIndex = currentTrack
      ? queue.findIndex((t) => t.id === currentTrack.id)
      : -1;
    let nextIdx = currentIndex + 1;

    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0; // loop back to first song
      } else {
        stopTrack(); // Stop playing
        return;
      }
    }

    playTrack(queue[nextIdx]);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      // If song played for more than 3 seconds, restart it
      seekTo(0);
      return;
    }

    const currentIndex = currentTrack
      ? queue.findIndex((t) => t.id === currentTrack.id)
      : -1;
    let prevIdx = currentIndex - 1;

    if (prevIdx < 0) {
      if (repeatMode === 'all') {
        prevIdx = queue.length - 1; // loop back to last song
      } else {
        seekTo(0); // restart first song
        return;
      }
    }

    playTrack(queue[prevIdx]);
  };

  const handleTrackEnded = () => {
    nextTrack();
  };

  return (
    <AudioContext.Provider
      value={{
        tracks,
        currentTrack,
        playbackState,
        currentTime,
        duration,
        volume,
        likedTracks,
        playlists,
        queue,
        repeatMode,
        isShuffled,
        equalizerBands,
        sleepTimerMinutes,
        sleepTimerRemaining,
        searchQuery,
        currentView,
        loadTracks,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        stopTrack,
        seekTo,
        changeVolume,
        toggleLike,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        setRepeat,
        toggleShuffle,
        changeEqGain,
        setSleepTimer,
        nextTrack,
        prevTrack,
        setSearchQuery,
        setCurrentView,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
