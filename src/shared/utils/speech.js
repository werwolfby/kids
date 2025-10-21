/**
 * Speech Synthesis Utilities
 *
 * This module provides functions for text-to-speech using the Web Speech API
 * with Russian language support.
 */

/**
 * Checks if speech synthesis is supported in the browser
 * @returns {boolean} - True if speech synthesis is available
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Cancels any ongoing speech
 */
export const cancelSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Speaks the given text in Russian
 * @param {string} text - The text to speak
 * @param {Object} options - Speech options
 * @param {number} options.rate - Speaking rate (default: 0.7)
 * @param {number} options.pitch - Voice pitch (default: 1.2)
 * @param {string} options.lang - Language code (default: 'ru-RU')
 * @param {Function} options.onEnd - Callback when speech ends
 * @param {Function} options.onError - Callback on error
 * @returns {SpeechSynthesisUtterance|null} - The utterance object or null if not supported
 */
export const speak = (text, options = {}) => {
  if (!isSpeechSupported() || !text) {
    return null;
  }

  const {
    rate = 0.7,
    pitch = 1.2,
    lang = 'ru-RU',
    onEnd = null,
    onError = null
  } = options;

  // Cancel any ongoing speech first
  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  if (onError) {
    utterance.onerror = onError;
  }

  window.speechSynthesis.speak(utterance);

  return utterance;
};

/**
 * Speaks a syllable with default Russian settings
 * @param {string} syllable - The syllable to speak
 * @param {Function} onEnd - Optional callback when speech ends
 * @returns {SpeechSynthesisUtterance|null} - The utterance object or null
 */
export const speakSyllable = (syllable, onEnd = null) => {
  return speak(syllable, {
    rate: 0.7,
    pitch: 1.2,
    lang: 'ru-RU',
    onEnd
  });
};

/**
 * Pauses speech synthesis
 */
export const pauseSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
  }
};

/**
 * Resumes speech synthesis
 */
export const resumeSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.resume();
  }
};

/**
 * Gets the current speech synthesis state
 * @returns {Object} - Object with speaking, pending, and paused states
 */
export const getSpeechState = () => {
  if (!isSpeechSupported()) {
    return { speaking: false, pending: false, paused: false };
  }

  return {
    speaking: window.speechSynthesis.speaking,
    pending: window.speechSynthesis.pending,
    paused: window.speechSynthesis.paused
  };
};
