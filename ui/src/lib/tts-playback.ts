/**
 * Text-to-speech audio playback queue logic.
 *
 * Uses Web Audio API (AudioContext) instead of HTMLAudioElement to avoid
 * autoplay restrictions. The AudioContext must be created/resumed during
 * a user gesture, after which async TTS synthesis can enqueue audio.
 */

export interface TTSPlaybackState {
  queue: string[];
  isPlaying: boolean;
}

export interface TTSQueueOps {
  enqueue: (base64: string, state: TTSPlaybackState) => TTSPlaybackState;
  dequeue: (state: TTSPlaybackState) => { item: string | null; state: TTSPlaybackState };
  stopAll: (state: TTSPlaybackState) => TTSPlaybackState;
}

export const ttsQueueOps: TTSQueueOps = {
  /**
   * Add audio to the playback queue.
   * Returns new state with the audio appended.
   */
  enqueue(base64: string, state: TTSPlaybackState): TTSPlaybackState {
    return {
      queue: [...state.queue, base64],
      isPlaying: state.isPlaying,
    };
  },

  /**
   * Remove and return the next item from the queue.
   * Returns null if queue is empty.
   */
  dequeue(state: TTSPlaybackState): { item: string | null; state: TTSPlaybackState } {
    if (state.queue.length === 0) {
      return { item: null, state };
    }
    const [item, ...rest] = state.queue;
    return {
      item,
      state: { queue: rest, isPlaying: state.isPlaying },
    };
  },

  /**
   * Clear all queued audio and mark as not playing.
   */
  stopAll(state: TTSPlaybackState): TTSPlaybackState {
    return {
      queue: [],
      isPlaying: false,
    };
  },
};

/**
 * Determine if playback should start automatically.
 * Returns true if queue has items and nothing is currently playing.
 */
export function shouldStartPlayback(state: TTSPlaybackState): boolean {
  return state.queue.length > 0 && !state.isPlaying;
}

/**
 * Truncate text for TTS synthesis to the maximum supported length.
 */
export function truncateForTTS(text: string, maxLen: number = 500): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen);
}
