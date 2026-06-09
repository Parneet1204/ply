import jsmediatags from 'jsmediatags';
import type { Track } from '../types';

/**
 * Parses ID3 tags from a local audio file.
 * Converts album art to a browser object URL for performance and memory efficiency.
 */
export const parseMetadata = (file: File): Promise<Omit<Track, 'id'>> => {
  return new Promise((resolve) => {
    // If not an MP3, skip ID3 parsing and use file name
    if (!file.name.toLowerCase().endsWith('.mp3')) {
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0, // Will be resolved dynamically by the audio engine
        coverUrl: null,
        file
      });
      return;
    }

    try {
      new jsmediatags.Reader(file).read({
        onSuccess: (tag) => {
          const tags = tag.tags;
          let coverUrl: string | null = null;

          if (tags.picture) {
            const { data, format } = tags.picture;
            const byteArray = new Uint8Array(data);
            const blob = new Blob([byteArray], { type: format });
            coverUrl = URL.createObjectURL(blob);
          }

          resolve({
            title: tags.title || file.name.replace(/\.[^/.]+$/, ""),
            artist: tags.artist || 'Unknown Artist',
            album: tags.album || 'Unknown Album',
            duration: 0,
            coverUrl,
            file
          });
        },
        onError: (err) => {
          console.warn('Metadata parsing failed, falling back to file name:', err);
          resolve({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: 0,
            coverUrl: null,
            file
          });
        }
      });
    } catch (e) {
      console.error('Error starting jsmediatags reader:', e);
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0,
        coverUrl: null,
        file
      });
    }
  });
};
