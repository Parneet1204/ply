export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string | null;
  file: File;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

export interface EqualizerBand {
  frequency: number;
  gain: number; // in dB, e.g. -12 to 12
}

export type PlaybackState = 'idle' | 'playing' | 'paused';
export type RepeatMode = 'off' | 'one' | 'all';
