/**
 * Списки популярных слов для трёх языков.
 *
 * Слова хранятся целыми словами (без дефисов) — на «склады» их делит
 * приложение через ../../shared/utils/syllableSplit.js, потому что правила
 * разбивки у русского, белорусского и украинского разные (ДЗ, ДЖ, Ў, апостроф).
 */

import { words as ru } from './wordsData.ru.js';
import { words as be } from './wordsData.be.js';
import { words as uk } from './wordsData.uk.js';
import { DEFAULT_LANGUAGE } from '../../shared/i18n/languages.js';

export const popularWordsByLanguage = { ru, be, uk };

/**
 * Список слов для языка (с откатом на язык по умолчанию).
 * @param {string} lang - 'ru' | 'be' | 'uk'
 * @returns {string[]}
 */
export const getPopularWords = (lang) =>
  popularWordsByLanguage[lang] || popularWordsByLanguage[DEFAULT_LANGUAGE];
