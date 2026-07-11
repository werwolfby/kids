/**
 * Russian Orthography Rules and Constants
 *
 * This module contains the Russian alphabet and orthography validation rules
 * for generating valid syllables.
 */

// Russian consonants (20 letters)
export const consonants = [
  'б', 'в', 'г', 'д', 'ж', 'з', 'к', 'л', 'м', 'н',
  'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ'
];

// Russian vowels (10 letters)
export const vowels = [
  'а', 'о', 'у', 'ы', 'э', 'я', 'ё', 'ю', 'и', 'е'
];

// The soft sign softens a preceding consonant. It is not a vowel and can only
// appear AFTER a consonant (never at the start of a syllable).
export const SOFT_SIGN = 'ь';

// Consonants that don't take a soft sign in Russian: velars (г, к, х) and ц.
// The hushing consonants ж, ш, ч, щ are allowed because they occur in real
// words (ночь, рожь, мышь, вещь, дочь).
const softSignInvalidConsonants = ['г', 'к', 'х', 'ц'];

/**
 * Whether a consonant can be followed by a soft sign (е.g. Н → НЬ)
 * @param {string} consonant - The consonant letter
 * @returns {boolean}
 */
export const canTakeSoftSign = (consonant) => {
  return consonants.includes(consonant) && !softSignInvalidConsonants.includes(consonant);
};

/**
 * List of invalid syllables according to Russian orthography rules
 *
 * Russian Orthography Rules:
 * 1. ЖИ, ШИ (never ЖЫ, ШЫ) - after Ж, Ш use И not Ы
 * 2. ЧА, ЩА (never ЧЯ, ЩЯ) - after Ч, Щ use А not Я
 * 3. ЧУ, ЩУ (never ЧЮ, ЩЮ) - after Ч, Щ use У not Ю
 * 4. After Ж, Ш, Ч, Щ, Ц never use Э
 */
const invalidSyllables = [
  // Ж: не сочетается с Ы, Я, Ю, Э
  'жы', 'жя', 'жю', 'жэ',
  // Ш: не сочетается с Ы, Я, Ё, Ю, Э
  'шы', 'шя', 'шё', 'шю', 'шэ',
  // Ч: не сочетается с Ы, Я, Ю, Э
  'чы', 'чя', 'чю', 'чэ',
  // Щ: не сочетается с Ы, Я, Ю, Э
  'щы', 'щя', 'щю', 'щэ',
  // Ц: не сочетается с Я, Ё, Ю, Э
  'ця', 'цё', 'цю', 'цэ'
];

/**
 * Checks if a letter is a Russian consonant
 * @param {string} letter - The letter to check
 * @returns {boolean} - True if the letter is a consonant
 */
export const isConsonant = (letter) => {
  return consonants.includes((letter || '').toLowerCase());
};

/**
 * Checks if a letter is a Russian vowel.
 * Everything that is NOT a vowel (consonants, й, ь, ъ) is treated as
 * "not a vowel" — handy for colouring letters as vowel/consonant.
 * @param {string} letter - The letter to check
 * @returns {boolean} - True if the letter is a vowel
 */
export const isVowel = (letter) => {
  return vowels.includes((letter || '').toLowerCase());
};

/**
 * Checks if a syllable is valid according to Russian orthography rules
 * @param {string} consonant - The consonant letter
 * @param {string} vowel - The vowel letter
 * @returns {boolean} - True if the syllable is valid, false otherwise
 */
export const isValidSyllable = (consonant, vowel) => {
  return !invalidSyllables.includes(consonant + vowel);
};

/**
 * Generates a random consonant
 * @returns {string} - A random Russian consonant
 */
export const getRandomConsonant = () => {
  return consonants[Math.floor(Math.random() * consonants.length)];
};

/**
 * Generates a random vowel
 * @returns {string} - A random Russian vowel
 */
export const getRandomVowel = () => {
  return vowels[Math.floor(Math.random() * vowels.length)];
};

/**
 * Gets all valid vowels for a given consonant
 * @param {string} consonant - The consonant letter
 * @returns {string[]} - Array of valid vowels for this consonant
 */
export const getValidVowelsForConsonant = (consonant) => {
  return vowels.filter(vowel => isValidSyllable(consonant, vowel));
};
