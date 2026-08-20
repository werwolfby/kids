/**
 * Предложения для чтения на трёх языках.
 *
 * У каждого языка свой набор уровней (одинаковой сложности, но не дословный
 * перевод — примеры подобраны так, чтобы звучать естественно на своём языке).
 */

import { levels as ru } from './sentencesData.ru.js';
import { levels as be } from './sentencesData.be.js';
import { levels as uk } from './sentencesData.uk.js';
import { DEFAULT_LANGUAGE } from '../../shared/i18n/languages.js';

export const sentenceLevelsByLanguage = { ru, be, uk };

/**
 * Уровни для языка (с откатом на язык по умолчанию).
 * @param {string} lang - 'ru' | 'be' | 'uk'
 */
export const getSentenceLevels = (lang) =>
  sentenceLevelsByLanguage[lang] || sentenceLevelsByLanguage[DEFAULT_LANGUAGE];

/**
 * Плоский список всех предложений языка (для режима «Все уровни»).
 * @param {string} lang
 * @returns {string[]}
 */
export const getAllSentences = (lang) =>
  getSentenceLevels(lang).flatMap(level => level.sentences);
