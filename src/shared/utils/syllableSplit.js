/**
 * Разбивка слова на «склады» (по методике Зайцева) для русского,
 * белорусского и украинского.
 *
 * Каждый склад — это не больше двух букв (кроме белорусских/украинских
 * диграфов ДЗ и ДЖ, которые обозначают один звук и не разрываются).
 * На каждом шаге отрезаем склад так, чтобы одиночных согласных было
 * как можно меньше:
 *   • согласная + гласная             (мо, ко, ва, дзе)
 *   • согласная + ь/ъ/апостроф        (рь, дь)
 *   • гласная + согласная             (иг, ес, ет) — если согласная иначе
 *                                       осталась бы одна (перед согласной / в конце)
 *   • гласная отдельно                (я, о)
 *   • одиночная согласная             (т, н) — только когда иначе никак
 *
 * Примеры: «моя» → «мо-я», «якорь» → «я-ко-рь», «твоя» → «т-во-я»,
 *          «играет» → «иг-ра-ет», «есть» → «ес-ть», «утро» → «ут-ро»,
 *          «дзеці» (be) → «дзе-ці», «джміль» (uk) → «дж-мі-ль».
 *
 * ВНИМАНИЕ: это НЕ фонетическое деление на слоги («мор-ковь»), а упрощённая
 * разбивка для самого начала обучения чтению.
 */

import { getAlphabet } from './orthography.js';
import { DEFAULT_LANGUAGE } from '../i18n/languages.js';

// Диграфы обозначают один звук, поэтому внутри склада не разрываются.
const DIGRAPHS = {
  ru: [],
  be: ['дз', 'дж'],
  uk: ['дз', 'дж']
};

/**
 * Разбивает слово на «единицы чтения»: обычная буква либо диграф (дз/дж).
 */
const toUnits = (chars, digraphs) => {
  const units = [];
  for (let i = 0; i < chars.length; i++) {
    const pair = chars[i] + (chars[i + 1] || '');
    if (digraphs.includes(pair)) {
      units.push(pair);
      i++;
    } else {
      units.push(chars[i]);
    }
  }
  return units;
};

/**
 * Разбивает слово на массив складов.
 * @param {string} word - слово (регистр не важен)
 * @param {string} lang - 'ru' | 'be' | 'uk'
 * @returns {string[]} - массив складов, например ['иг', 'ра', 'ет']
 */
export const splitToWarehouses = (word, lang = DEFAULT_LANGUAGE) => {
  const alphabet = getAlphabet(lang);
  const vowelSet = new Set(alphabet.vowels);
  const signSet = new Set(alphabet.signs);

  const isVowel = (u) => vowelSet.has(u);
  const isSign = (u) => signSet.has(u);
  // Согласная — всё, что буква этого языка, но не гласная и не знак
  // (сюда попадают также Й, Ў, Ґ и диграфы ДЗ/ДЖ).
  const isConsonant = (u) =>
    !!u && !isVowel(u) && !isSign(u) && alphabet.letterPattern.test(u[0]);

  const units = toUnits(word.toLowerCase().split(''), DIGRAPHS[lang] || []);
  const result = [];
  let i = 0;

  while (i < units.length) {
    const unit = units[i];
    const next = units[i + 1];
    const afterNext = units[i + 2];

    if (isConsonant(unit) && next && (isVowel(next) || isSign(next))) {
      // согласная + гласная  или  согласная + мягкий знак / апостроф
      result.push(unit + next);
      i += 2;
    } else if (
      isVowel(unit) &&
      isConsonant(next) &&
      !isVowel(afterNext) &&
      !isSign(afterNext)
    ) {
      // гласная + согласная: согласная иначе осталась бы одна
      // (дальше согласная или конец слова), поэтому закрываем ею склад
      result.push(unit + next);
      i += 2;
    } else {
      // гласная отдельно, либо одиночная согласная (когда иначе никак)
      result.push(unit);
      i += 1;
    }
  }

  return result;
};

/**
 * Разбивает слово и склеивает склады через дефис: «моя» → «мо-я».
 * @param {string} word
 * @param {string} lang
 * @returns {string}
 */
export const hyphenate = (word, lang = DEFAULT_LANGUAGE) =>
  splitToWarehouses(word, lang).join('-');
