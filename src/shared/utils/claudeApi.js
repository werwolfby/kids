/**
 * Придумывание рассказа через Claude API — прямо из браузера.
 *
 * Ключ вводит сам взрослый, лежит он только в localStorage этого браузера и
 * уходит напрямую в api.anthropic.com. Для такого «прямого» вызова SDK нужен
 * `dangerouslyAllowBrowser: true` — тогда он добавляет заголовок
 * `anthropic-dangerous-direct-browser-access`, без которого браузеру ответит CORS.
 * Для публичного сайта так делать нельзя (ключ виден в devtools), для домашнего
 * использования — нормально.
 */

export const STORY_MODEL = 'claude-opus-5';

/**
 * SDK грузим только когда нажали «Придумать рассказ»: он весит больше, чем всё
 * остальное приложение, а нужен далеко не всем.
 */
let sdkPromise = null;
const loadSdk = () => {
  if (!sdkPromise) sdkPromise = import('@anthropic-ai/sdk').then(m => m.default);
  return sdkPromise;
};

/** Где храним ключ (вводится один раз на устройство). */
export const API_KEY_STORAGE = 'kids-apps-claude-key';

export const loadApiKey = () => {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
};

export const saveApiKey = (key) => {
  try {
    if (key) localStorage.setItem(API_KEY_STORAGE, key);
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    /* приватный режим — ключ просто не запомнится */
  }
};

/** На каком языке просим рассказ. */
const LANGUAGE_NAMES = {
  ru: 'русском языке',
  be: 'белорусском языке (беларуская мова)',
  uk: 'украинском языке (українська мова)'
};

/** Длина предложений — те же уровни, что и у готовых наборов. */
const LEVEL_RULES = {
  1: '2–3 коротких слова в предложении',
  2: '3–4 слова в предложении',
  3: '4–5 слов в предложении',
  4: '5–8 слов в предложении'
};

const SYSTEM = [
  'Ты пишешь очень простые тексты для ребёнка 5–6 лет, который только учится',
  'читать по слогам. Пиши добрые, понятные истории про знакомые ребёнку вещи.',
  'Отвечай только текстом рассказа — без заголовка, пояснений и списков.'
].join(' ');

const buildPrompt = ({ topic, words, level, lang }) => [
  `Напиши рассказ на ${LANGUAGE_NAMES[lang] || LANGUAGE_NAMES.ru}.`,
  `Тема: ${topic || 'любая добрая тема про животных или семью'}.`,
  `Длина — примерно ${words} слов.`,
  `Предложения короткие: ${LEVEL_RULES[level] || LEVEL_RULES[2]}.`,
  '',
  'Требования:',
  '- только простые, знакомые ребёнку слова;',
  '- из знаков препинания — только точка, восклицательный и вопросительный знак;',
  '- никаких цифр, латинских букв, кавычек, тире, скобок и слов через дефис;',
  '- имена короткие и простые;',
  '- никаких заголовков и пояснений — только сам рассказ.'
].join('\n');

/** Ошибка с кодом, понятным интерфейсу (auth / rate / network / refusal / api). */
const fail = (code, message) => {
  const error = new Error(message || code);
  error.code = code;
  return error;
};

/** Ошибка SDK → код для интерфейса. */
const toFail = (error, Anthropic) => {
  if (error instanceof Anthropic.AuthenticationError) return fail('auth');
  if (error instanceof Anthropic.RateLimitError) return fail('rate');
  if (error instanceof Anthropic.APIConnectionError) return fail('network');
  if (error instanceof Anthropic.APIError) return fail('api', error.message);
  return fail('api', error?.message || String(error));
};

const textOf = (response) => response.content
  .filter(block => block.type === 'text')
  .map(block => block.text)
  .join('\n')
  .trim();

/**
 * Просит Claude придумать рассказ.
 * @param {Object} options
 * @param {string} options.apiKey - ключ Claude API
 * @param {string} options.topic - тема («про кота»), можно пустую
 * @param {number} options.words - примерная длина в словах
 * @param {number} options.level - 1–4, длина предложений
 * @param {string} options.lang - 'ru' | 'be' | 'uk'
 * @returns {Promise<string>} - текст рассказа
 */
export const generateStory = async ({ apiKey, topic, words, level, lang }) => {
  if (!apiKey) throw fail('key');

  const Anthropic = await loadSdk();
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const params = {
    model: STORY_MODEL,
    max_tokens: 8000,
    output_config: { effort: 'medium' },
    system: SYSTEM,
    messages: [{ role: 'user', content: buildPrompt({ topic, words, level, lang }) }]
  };

  let response;
  try {
    // Серверный фолбэк: если модель откажется отвечать, тот же запрос
    // доигрывается на другой модели в рамках этого же вызова.
    response = await client.beta.messages.create({
      ...params,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default'
    });
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError) {
      // Бета фолбэков недоступна для этого ключа — просим без неё.
      response = await client.messages.create(params).catch(e => { throw toFail(e, Anthropic); });
    } else {
      throw toFail(error, Anthropic);
    }
  }

  if (response.stop_reason === 'refusal') throw fail('refusal');

  const text = textOf(response);
  if (!text) throw fail('api', 'пустой ответ');
  return text;
};
