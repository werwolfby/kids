/**
 * Озвучка через Web Speech API для русского, белорусского и украинского.
 *
 * Белорусских (а часто и украинских) голосов в браузерах обычно нет, поэтому
 * модуль подбирает ближайший установленный голос: be → uk → ru.
 */

import { getLanguage, DEFAULT_LANGUAGE } from '../i18n/languages.js';

/**
 * Поддерживается ли синтез речи в браузере
 * @returns {boolean}
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Отменяет текущую озвучку
 */
export const cancelSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Подбирает голос под язык: сначала точное совпадение, потом языки-запасные
 * (для белорусского — украинский, затем русский).
 * @param {string} lang - код языка приложения ('ru' | 'be' | 'uk')
 * @returns {{voice: SpeechSynthesisVoice|null, lang: string}}
 */
export const resolveVoice = (lang = DEFAULT_LANGUAGE) => {
  const language = getLanguage(lang);
  const candidates = [language.speechLang, ...language.speechFallbacks];

  if (!isSpeechSupported()) {
    return { voice: null, lang: language.speechLang };
  }

  const voices = window.speechSynthesis.getVoices() || [];
  for (const candidate of candidates) {
    const prefix = candidate.split('-')[0];
    const voice = voices.find(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix));
    if (voice) return { voice, lang: voice.lang || candidate };
  }

  // Голосов ещё нет (браузер грузит их асинхронно) либо ни один не подошёл —
  // просто просим нужный язык и надеемся на системный голос.
  return { voice: null, lang: language.speechLang };
};

/**
 * Произносит текст на выбранном языке
 * @param {string} text - что произнести
 * @param {Object} options - настройки
 * @param {number} options.rate - скорость (по умолчанию 0.7)
 * @param {number} options.pitch - высота голоса (по умолчанию 1.2)
 * @param {string} options.lang - код языка приложения ('ru' | 'be' | 'uk')
 * @param {Function} options.onEnd - колбэк по окончании
 * @param {Function} options.onError - колбэк при ошибке
 * @returns {SpeechSynthesisUtterance|null}
 */
export const speak = (text, options = {}) => {
  if (!isSpeechSupported() || !text) {
    return null;
  }

  const {
    rate = 0.7,
    pitch = 1.2,
    lang = DEFAULT_LANGUAGE,
    onEnd = null,
    onError = null
  } = options;

  // Сначала отменяем всё, что говорится сейчас
  cancelSpeech();

  const { voice, lang: voiceLang } = resolveVoice(lang);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  if (voice) utterance.voice = voice;
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
 * Произносит слог с настройками «для чтения по слогам»
 * @param {string} syllable
 * @param {Function} onEnd
 * @param {string} lang
 * @returns {SpeechSynthesisUtterance|null}
 */
export const speakSyllable = (syllable, onEnd = null, lang = DEFAULT_LANGUAGE) => {
  return speak(syllable, {
    rate: 0.7,
    pitch: 1.2,
    lang,
    onEnd
  });
};

/**
 * Ставит озвучку на паузу
 */
export const pauseSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
  }
};

/**
 * Продолжает озвучку
 */
export const resumeSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.resume();
  }
};

/**
 * Текущее состояние синтеза речи
 * @returns {Object} - { speaking, pending, paused }
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
