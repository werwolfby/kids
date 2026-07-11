/**
 * Syllable Generation Utilities
 *
 * This module provides functions for generating Russian syllables
 * with proper validation according to orthography rules.
 */

import {
  consonants,
  vowels,
  isValidSyllable,
  canTakeSoftSign,
  SOFT_SIGN
} from './russianOrthography.js';

/**
 * Resolves the syllable order for a single syllable.
 * 'mixed' randomly becomes 'cv' or 'vc' on each call, so a mixed session
 * produces an unpredictable blend of both orders.
 * @param {string} order - 'cv', 'vc', or 'mixed'
 * @returns {string} - 'cv' or 'vc'
 */
const resolveOrder = (order) => {
  if (order === 'mixed') {
    return Math.random() < 0.5 ? 'cv' : 'vc';
  }
  return order;
};

// An empty/missing selection means "all of them".
const orAll = (selected, all) => (selected && selected.length > 0 ? selected : all);

/**
 * Builds the full list of syllables allowed by the given constraints.
 * Enumerating the pool (rather than reject-sampling) keeps generation correct
 * and guarantees termination even for tiny selections.
 * @param {string} order - resolved 'cv' or 'vc'
 * @param {object} options - { consonants, vowels, softSign }
 * @returns {string[]} - Every valid syllable for these constraints
 */
const buildSyllablePool = (order, { consonants: ac, vowels: av, softSign = false } = {}) => {
  const cons = orAll(ac, consonants);
  const vows = orAll(av, vowels);
  const pool = [];

  if (order === 'cv') {
    for (const c of cons) {
      for (const v of vows) {
        if (isValidSyllable(c, v)) pool.push(c + v);
      }
      // Soft sign sits in the vowel slot but only after a consonant (CV only).
      if (softSign && canTakeSoftSign(c)) pool.push(c + SOFT_SIGN);
    }
  } else {
    // VC: vowel first, then consonant — every combination is valid, no soft sign.
    for (const v of vows) {
      for (const c of cons) {
        pool.push(v + c);
      }
    }
  }

  return pool;
};

/**
 * Generates a random syllable
 * @param {string} order - 'cv', 'vc', or 'mixed'
 * @param {object} options - { consonants?, vowels?, softSign? } (empty arrays = all)
 * @returns {string} - A random syllable
 */
export const generateRandomSyllable = (order = 'cv', options = {}) => {
  order = resolveOrder(order);
  let pool = buildSyllablePool(order, options);

  // The selection can rule out every syllable (e.g. only Ж + only Ы in CV order).
  // Fall back to ignoring the letter filters so we always show something valid.
  if (pool.length === 0) {
    pool = buildSyllablePool(order, { softSign: options.softSign });
  }

  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * Generates a syllable different from the given one
 * @param {string} currentSyllable - The syllable to avoid
 * @param {string} order - 'cv', 'vc', or 'mixed'
 * @param {object} options - { consonants?, vowels?, softSign? }
 * @returns {string} - A new syllable, or the same one if only one is possible
 */
export const generateDifferentSyllable = (currentSyllable, order = 'cv', options = {}) => {
  let newSyllable = currentSyllable;
  // Bounded retry: if the constraints allow only one syllable, give up gracefully.
  for (let i = 0; i < 25; i++) {
    newSyllable = generateRandomSyllable(order, options);
    if (newSyllable !== currentSyllable) return newSyllable;
  }
  return newSyllable;
};

/**
 * Formats a syllable with case transformation
 * @param {string} syllable - The syllable to format
 * @param {boolean} isUpperCase - Whether to use uppercase
 * @returns {string} - The formatted syllable
 */
export const formatSyllable = (syllable, isUpperCase = true) => {
  if (!syllable || syllable.length < 2) return '';

  const chars = syllable.split('');
  return chars.map(char => isUpperCase ? char.toUpperCase() : char).join('');
};
