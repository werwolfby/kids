/**
 * Разбивка слова на «склады» (по методике Зайцева).
 *
 * Каждый склад — это не больше двух букв. На каждом шаге отрезаем склад так,
 * чтобы одиночных согласных было как можно меньше:
 *   • согласная + гласная             (мо, ко, ва)
 *   • согласная + ь/ъ                 (рь, дь)
 *   • гласная + согласная             (иг, ес, ет) — если согласная иначе
 *                                       осталась бы одна (перед согласной / в конце)
 *   • гласная отдельно                (я, о)
 *   • одиночная согласная             (т, н) — только когда иначе никак
 *
 * Примеры: «моя» → «мо-я», «якорь» → «я-ко-рь», «твоя» → «т-во-я»,
 *          «играет» → «иг-ра-ет», «есть» → «ес-ть», «утро» → «ут-ро».
 *
 * ВНИМАНИЕ: это НЕ фонетическое деление на слоги («мор-ковь»), а упрощённая
 * разбивка для самого начала обучения чтению. Настоящие слоги будут в
 * отдельном приложении.
 */

const VOWELS = new Set('аеёиоуыэюя'.split(''));
const SIGNS = new Set(['ь', 'ъ']);

const isVowel = (ch) => VOWELS.has(ch);
const isSign = (ch) => SIGNS.has(ch);
const isConsonant = (ch) => /[а-яё]/i.test(ch) && !isVowel(ch) && !isSign(ch);

/**
 * Разбивает слово на массив складов.
 * @param {string} word - слово (строчными буквами)
 * @returns {string[]} - массив складов, например ['иг', 'ра', 'ет']
 */
export const splitToWarehouses = (word) => {
  const chars = word.toLowerCase().split('');
  const result = [];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];
    const next = chars[i + 1];
    const afterNext = chars[i + 2];

    if (isConsonant(ch) && next && (isVowel(next) || isSign(next))) {
      // согласная + гласная  или  согласная + мягкий/твёрдый знак
      result.push(ch + next);
      i += 2;
    } else if (
      isVowel(ch) &&
      isConsonant(next) &&
      !isVowel(afterNext) &&
      !isSign(afterNext)
    ) {
      // гласная + согласная: согласная иначе осталась бы одна
      // (дальше согласная или конец слова), поэтому закрываем ею склад
      result.push(ch + next);
      i += 2;
    } else {
      // гласная отдельно, либо одиночная согласная (когда иначе никак)
      result.push(ch);
      i += 1;
    }
  }

  return result;
};

/**
 * Разбивает слово и склеивает склады через дефис: «моя» → «мо-я».
 * @param {string} word
 * @returns {string}
 */
export const hyphenate = (word) => splitToWarehouses(word).join('-');
