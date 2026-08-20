/**
 * Языки приложения / Мовы праграмы / Мови застосунку.
 *
 * Русский — язык по умолчанию. Код языка хранится в localStorage, поэтому
 * выбор сохраняется между запусками.
 */

export const LANGUAGES = [
  {
    code: 'ru',
    nativeName: 'Русский',
    flag: '🇷🇺',
    // Код для Web Speech API + языки, на которые можно «упасть», если в
    // системе нет нужного голоса (белорусских голосов почти нигде нет).
    speechLang: 'ru-RU',
    speechFallbacks: [],
    htmlLang: 'ru'
  },
  {
    code: 'be',
    nativeName: 'Беларуская',
    flag: '🇧🇾',
    speechLang: 'be-BY',
    // Белорусского голоса в браузерах обычно нет — читаем украинским/русским,
    // они ближе всего по звучанию к белорусскому.
    speechFallbacks: ['uk-UA', 'ru-RU'],
    htmlLang: 'be'
  },
  {
    code: 'uk',
    nativeName: 'Українська',
    flag: '🇺🇦',
    speechLang: 'uk-UA',
    speechFallbacks: ['ru-RU'],
    htmlLang: 'uk'
  }
];

export const DEFAULT_LANGUAGE = 'ru';

export const LANGUAGE_CODES = LANGUAGES.map(l => l.code);

export const isSupportedLanguage = (code) => LANGUAGE_CODES.includes(code);

/**
 * Метаданные языка по коду (с откатом на язык по умолчанию).
 * @param {string} code
 */
export const getLanguage = (code) =>
  LANGUAGES.find(l => l.code === code) ||
  LANGUAGES.find(l => l.code === DEFAULT_LANGUAGE);
