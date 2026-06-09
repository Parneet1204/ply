import type { Track, PlaybackState } from '../types';

export class AudioService {
  private audio: HTMLAudioElement;
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private currentTrack: Track | null = null;
  private currentObjectUrl: string | null = null;
  private state: PlaybackState = 'idle';

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getState(): PlaybackState {
    return this.state;
  }

  // Callbacks
  private onTimeUpdateCallback: ((current: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private onStateChangeCallback: ((state: PlaybackState) => void) | null = null;

  // Equalizer Frequencies: 60Hz, 230Hz, 910Hz, 4kHz, 14kHz
  private eqFrequencies = [60, 230, 910, 4000, 14000];

  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';

    // Hook HTML5 Audio events
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
      }
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('ended', () => {
      this.setState('idle');
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    this.audio.addEventListener('play', () => this.setState('playing'));
    this.audio.addEventListener('pause', () => this.setState('paused'));
  }

  private initAudioContext() {
    if (this.ctx) return;

    // Initialize AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Create Source
    this.source = this.ctx.createMediaElementSource(this.audio);

    // Create Equalizer Filters (5-band EQ)
    let lastNode: AudioNode = this.source;

    this.eqFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const filter = this.ctx.createBiquadFilter();
      
      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === this.eqFrequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
      }

      filter.frequency.value = freq;
      filter.Q.value = 1.0;
      filter.gain.value = 0; // Flat by default

      lastNode.connect(filter);
      this.filters.push(filter);
      lastNode = filter;
    });

    // Create Analyser Node for Visualizer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256; // High frequency resolution
    
    lastNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  private resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(track: Track) {
    this.initAudioContext();
    this.resumeContext();

    // Revoke previous object URL if any
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }

    this.currentTrack = track;
    this.currentObjectUrl = URL.createObjectURL(track.file);
    
    this.audio.src = this.currentObjectUrl;
    this.audio.play()
      .then(() => {
        this.setState('playing');
        this.setupMediaSession(track);
      })
      .catch((err) => {
        console.error('Audio playback failed:', err);
        this.setState('idle');
      });
  }

  public pause() {
    this.audio.pause();
    this.setState('paused');
  }

  public resume() {
    this.initAudioContext();
    this.resumeContext();
    this.audio.play()
      .then(() => {
        this.setState('playing');
      })
      .catch((err) => {
        console.error('Audio resume failed:', err);
      });
  }

  public stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.setState('idle');
  }

  public seek(seconds: number) {
    if (!isNaN(seconds) && isFinite(seconds)) {
      this.audio.currentTime = seconds;
      this.updateMediaSessionPosition();
    }
  }

  public setVolume(vol: number) {
    // Volume expected between 0 and 1
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  public setEqGain(bandIdx: number, gain: number) {
    this.initAudioContext();
    if (this.filters[bandIdx]) {
      // Clamp between -12dB and +12dB
      this.filters[bandIdx].gain.value = Math.max(-12, Math.min(12, gain));
    }
  }

  public getAnalyserData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(0);
    }
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Event hook registration
  public onTimeUpdate(cb: (current: number, duration: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public onStateChange(cb: (state: PlaybackState) => void) {
    this.onStateChangeCallback = cb;
  }

  private setState(state: PlaybackState) {
    this.state = state;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state);
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state === 'playing' ? 'playing' : 'paused';
    }
  }

  // Media Session Controls (Lock Screen & Background controls)
  private setupMediaSession(track: Track) {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.coverUrl ? [{ src: track.coverUrl }] : []
    });
  }

  public setMediaSessionHandlers(actions: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
  }) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', actions.onPlay);
      navigator.mediaSession.setActionHandler('pause', actions.onPause);
      navigator.mediaSession.setActionHandler('previoustrack', actions.onPrev);
      navigator.mediaSession.setActionHandler('nexttrack', actions.onNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession action handlers could not be fully registered:', e);
    }
  }

  private updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || !this.audio.duration) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: this.audio.duration,
        playbackRate: this.audio.playbackRate,
        position: this.audio.currentTime
      });
    } catch (e) {
      // Chrome sometimes throws errors for invalid ranges
    }
  }

  public getDuration(): number {
    return this.audio.duration || 0;
  }

  public destroy() {
    this.stop();
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

// Single instance to use across application
export const audioService = new AudioService();
export default audioService;
