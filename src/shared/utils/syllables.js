/**
 * Генерация слогов с учётом языка.
 *
 * Пул слогов перечисляется целиком (а не подбирается «наугад с отбраковкой»),
 * поэтому генерация всегда завершается и остаётся корректной даже для очень
 * узкого набора букв.
 */

import {
  getConsonants,
  getVowels,
  getInitialVowels,
  getSoftSign,
  isValidSyllable,
  canTakeSoftSign
} from './orthography.js';
import { DEFAULT_LANGUAGE } from '../i18n/languages.js';

/**
 * Определяет порядок для одного слога.
 * 'mixed' на каждом вызове случайно становится 'cv' или 'vc', поэтому
 * смешанный режим даёт непредсказуемую смесь обоих порядков.
 * @param {string} order - 'cv', 'vc' или 'mixed'
 * @returns {string} - 'cv' или 'vc'
 */
const resolveOrder = (order) => {
  if (order === 'mixed') {
    return Math.random() < 0.5 ? 'cv' : 'vc';
  }
  return order;
};

// Пустой/отсутствующий выбор означает «все буквы».
const orAll = (selected, all) => (selected && selected.length > 0 ? selected : all);

/**
 * Строит полный список слогов, допустимых при заданных ограничениях.
 * @param {string} order - 'cv' или 'vc'
 * @param {object} options - { consonants, vowels, softSign, lang }
 * @returns {string[]}
 */
const buildSyllablePool = (order, { consonants: ac, vowels: av, softSign = false, lang = DEFAULT_LANGUAGE } = {}) => {
  const cons = orAll(ac, getConsonants(lang));
  const pool = [];

  if (order === 'cv') {
    const vows = orAll(av, getVowels(lang));
    for (const c of cons) {
      for (const v of vows) {
        if (isValidSyllable(c, v, lang)) pool.push(c + v);
      }
      // Мягкий знак стоит на месте гласной, но только после согласной (только CV).
      if (softSign && canTakeSoftSign(c, lang)) pool.push(c + getSoftSign(lang));
    }
  } else {
    // VC: сначала гласная, потом согласная. Гласные, которые не начинают слог
    // (русское/белорусское Ы, украинское И), в этом порядке не участвуют.
    const initial = getInitialVowels(lang);
    const vows = orAll(av && av.filter(v => initial.includes(v)), initial);
    for (const v of vows) {
      for (const c of cons) {
        pool.push(v + c);
      }
    }
  }

  return pool;
};

/**
 * Генерирует случайный слог.
 * @param {string} order - 'cv', 'vc' или 'mixed'
 * @param {object} options - { consonants?, vowels?, softSign?, lang? } (пустые массивы = все)
 * @returns {string}
 */
export const generateRandomSyllable = (order = 'cv', options = {}) => {
  order = resolveOrder(order);
  let pool = buildSyllablePool(order, options);

  // Выбор может исключить вообще все слоги (например, только Ж и только Ы в CV).
  // Тогда игнорируем фильтры по буквам, чтобы всегда показать что-то валидное.
  if (pool.length === 0) {
    pool = buildSyllablePool(order, { softSign: options.softSign, lang: options.lang });
  }

  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * Генерирует слог, отличный от заданного.
 * @param {string} currentSyllable
 * @param {string} order - 'cv', 'vc' или 'mixed'
 * @param {object} options - { consonants?, vowels?, softSign?, lang? }
 * @returns {string}
 */
export const generateDifferentSyllable = (currentSyllable, order = 'cv', options = {}) => {
  let newSyllable = currentSyllable;
  // Ограниченное число попыток: если возможен только один слог — сдаёмся мягко.
  for (let i = 0; i < 25; i++) {
    newSyllable = generateRandomSyllable(order, options);
    if (newSyllable !== currentSyllable) return newSyllable;
  }
  return newSyllable;
};

/**
 * Приводит слог к нужному регистру.
 * @param {string} syllable
 * @param {boolean} isUpperCase
 * @returns {string}
 */
export const formatSyllable = (syllable, isUpperCase = true) => {
  if (!syllable || syllable.length < 2) return '';

  const chars = syllable.split('');
  return chars.map(char => isUpperCase ? char.toUpperCase() : char).join('');
};
