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
  getRandomConsonant,
  getRandomVowel,
  getValidVowelsForConsonant
} from './russianOrthography.js';

/**
 * Generates a random syllable
 * @param {string} order - 'cv' for consonant-vowel, 'vc' for vowel-consonant
 * @returns {string} - A random syllable
 */
export const generateRandomSyllable = (order = 'cv') => {
  let consonant, vowel;

  if (order === 'cv') {
    // For CV order, ensure valid combination
    do {
      consonant = getRandomConsonant();
      vowel = getRandomVowel();
    } while (!isValidSyllable(consonant, vowel));
    return consonant + vowel;
  } else {
    // For VC order, all combinations are valid
    vowel = getRandomVowel();
    consonant = getRandomConsonant();
    return vowel + consonant;
  }
};

/**
 * Generates a syllable with a specific consonant
 * @param {string} consonant - The consonant to use
 * @param {string} order - 'cv' for consonant-vowel, 'vc' for vowel-consonant
 * @returns {string} - A syllable with the given consonant
 */
export const generateSyllableWithConsonant = (consonant, order = 'cv') => {
  let vowel;

  if (order === 'cv') {
    // For CV mode, get only valid vowels for this consonant
    const validVowels = getValidVowelsForConsonant(consonant);
    vowel = validVowels[Math.floor(Math.random() * validVowels.length)];
    return consonant + vowel;
  } else {
    // For VC mode, no validation needed - all combinations are valid
    vowel = getRandomVowel();
    return vowel + consonant;
  }
};

/**
 * Generates a syllable different from the given one
 * @param {string} currentSyllable - The syllable to avoid
 * @param {string} order - 'cv' for consonant-vowel, 'vc' for vowel-consonant
 * @param {string|null} selectedConsonant - Optional consonant filter
 * @returns {string} - A new syllable different from currentSyllable
 */
export const generateDifferentSyllable = (currentSyllable, order = 'cv', selectedConsonant = null) => {
  let newSyllable;
  do {
    newSyllable = selectedConsonant
      ? generateSyllableWithConsonant(selectedConsonant, order)
      : generateRandomSyllable(order);
  } while (newSyllable === currentSyllable);
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
