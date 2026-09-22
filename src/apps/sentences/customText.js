/**
 * Свой текст для чтения: произвольный текст (написанный руками или придуманный
 * Claude) превращается в такой же список предложений, как готовые наборы.
 *
 * Предложения в приложении хранятся строчными буквами и без знаков препинания —
 * на склады их разбивает syllableSplit.js, а регистром управляет кнопка АБ/аб.
 * Поэтому здесь текст режется по точкам и приводится к тому же виду.
 */

/** Больше слов в одной карточке не показываем: иначе не влезет на экран. */
const MAX_WORDS = 10;

/** Где храним свой текст, чтобы он не терялся при перезагрузке. */
export const CUSTOM_TEXT_STORAGE = 'kids-apps-custom-text';

export const loadCustomText = () => {
  try {
    return localStorage.getItem(CUSTOM_TEXT_STORAGE) || '';
  } catch {
    return '';
  }
};

export const saveCustomText = (text) => {
  try {
    if (text) localStorage.setItem(CUSTOM_TEXT_STORAGE, text);
    else localStorage.removeItem(CUSTOM_TEXT_STORAGE);
  } catch {
    /* приватный режим — текст просто не запомнится */
  }
};

/** Длинное предложение без точек делим на куски по MAX_WORDS слов. */
const chunk = (words) => {
  const parts = [];
  for (let i = 0; i < words.length; i += MAX_WORDS) {
    parts.push(words.slice(i, i + MAX_WORDS).join(' '));
  }
  return parts;
};

/**
 * Текст → массив предложений для чтения.
 * @param {string} text
 * @returns {string[]}
 */
export const textToSentences = (text) => String(text || '')
  .toLowerCase()
  // Дефис не склад: «что-то» → «что то», «из-за» → «из за».
  .replace(/[-–—]/g, ' ')
  .split(/[.!?…;:()\n\r]+/)
  .flatMap((part) => {
    const words = part
      // Цифры, кавычки, звёздочки списков — всё, что не буква и не апостроф.
      .replace(/[^\p{L}'ʼ’\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
    return words.length ? chunk(words) : [];
  })
  .filter(sentence => /\p{L}/u.test(sentence));
