/**
 * Constants for the Syllables App
 */

export const BACKGROUNDS = [
  { name: 'Белый', value: 'bg-white', text: 'text-gray-800' },
  { name: 'Черный', value: 'bg-gray-900', text: 'text-white' },
  { name: 'Серый', value: 'bg-gray-100', text: 'text-gray-800' },
  { name: 'Бежевый', value: 'bg-amber-50', text: 'text-gray-800' },
  { name: 'Синий', value: 'bg-blue-50', text: 'text-gray-800' }
];

export const SYLLABLE_ORDER = {
  CV: 'cv', // consonant-vowel (БА)
  VC: 'vc'  // vowel-consonant (АБ)
};

export const MODE = {
  RANDOM: 'random',
  SELECTED: 'selected',
  GAME_3D: '3d-game'
};
