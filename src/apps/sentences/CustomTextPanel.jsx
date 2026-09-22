import { useMemo, useState } from 'react';
import { generateStory, loadApiKey, saveApiKey } from '../../shared/utils/claudeApi';
import { textToSentences } from './customText';

/** Примерная длина рассказа в словах. */
const LENGTHS = [20, 40, 60, 100, 150];
/** Длина предложений — те же четыре уровня, что и у готовых наборов. */
const LEVELS = [1, 2, 3, 4];

/**
 * CustomTextPanel — «Свой текст».
 *
 * Взрослый либо сам пишет/вставляет текст, либо просит Claude придумать рассказ
 * на тему и нужной длины. Дальше текст режется на предложения (customText.js) и
 * читается так же, как готовые наборы.
 *
 * Ключ Claude API вводится один раз и хранится в localStorage этого браузера.
 */
const CustomTextPanel = ({ t, fill, lang, initialText = '', onApply, onClose }) => {
  const [topic, setTopic] = useState('');
  const [words, setWords] = useState(60);
  const [level, setLevel] = useState(2);
  const [text, setText] = useState(initialText);
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [showKey, setShowKey] = useState(() => !loadApiKey());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sentences = useMemo(() => textToSentences(text), [text]);

  const chip = (on) => `px-4 py-2 rounded-xl text-base font-bold transition ${
    on ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  const generate = async () => {
    setError('');
    setBusy(true);
    try {
      const story = await generateStory({ apiKey: apiKey.trim(), topic: topic.trim(), words, level, lang });
      saveApiKey(apiKey.trim());
      setText(story);
    } catch (e) {
      const messages = t.custom.errors;
      setError(e.code === 'api'
        ? fill(messages.api, { message: e.message })
        : (messages[e.code] || fill(messages.api, { message: e.message })));
      if (e.code === 'key') setShowKey(true);
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!sentences.length) {
      setError(t.custom.errors.empty);
      return;
    }
    onApply(text);
  };

  return (
    <div
      className="absolute inset-0 z-20 bg-black/50 flex items-start md:items-center justify-center p-3 md:p-4 overflow-y-auto"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 max-w-2xl w-full cursor-default my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-purple-600 text-center mb-5">
          {t.custom.title}
        </h2>

        {/* Тема */}
        <label className="block text-lg font-bold text-gray-700 mb-2">{t.custom.topicLabel}</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t.custom.topicPlaceholder}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg mb-3 focus:border-purple-400 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2 mb-5">
          {t.custom.topics.map((preset) => (
            <button
              key={preset}
              onClick={() => setTopic(preset.replace(/^\S+\s/, ''))}
              className="px-3 py-2 rounded-xl text-base font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Длина рассказа */}
        <label className="block text-lg font-bold text-gray-700 mb-2">{t.custom.lengthLabel}</label>
        <div className="flex flex-wrap gap-2 mb-5">
          {LENGTHS.map((n) => (
            <button key={n} onClick={() => setWords(n)} className={chip(words === n)}>
              {fill(t.custom.wordsN, { n })}
            </button>
          ))}
        </div>

        {/* Длина предложений */}
        <label className="block text-lg font-bold text-gray-700 mb-2">{t.custom.levelLabel}</label>
        <div className="flex flex-wrap gap-2 mb-5">
          {LEVELS.map((n) => (
            <button key={n} onClick={() => setLevel(n)} className={chip(level === n)}>
              {fill(t.sentences.levelShort, { n })}
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={busy}
          className="w-full py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition disabled:opacity-60 mb-2"
        >
          {busy ? t.custom.generating : t.custom.generate}
        </button>

        {/* Ключ Claude API */}
        <button
          onClick={() => setShowKey(s => !s)}
          className="text-base font-semibold text-gray-500 hover:text-gray-700 transition mb-2"
        >
          {t.custom.keyToggle}
        </button>
        {showKey && (
          <div className="mb-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); saveApiKey(e.target.value.trim()); }}
              placeholder={t.custom.keyPlaceholder}
              autoComplete="off"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-mono focus:border-purple-400 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-2">{t.custom.keyHint}</p>
          </div>
        )}

        {/* Текст */}
        <label className="block text-lg font-bold text-gray-700 mt-3 mb-2">{t.custom.textLabel}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.custom.textPlaceholder}
          rows={7}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg leading-relaxed focus:border-purple-400 focus:outline-none"
        />
        <div className="flex items-center justify-between mt-2 mb-4">
          <span className="text-base text-gray-500">{fill(t.custom.sentencesN, { n: sentences.length })}</span>
          {text && (
            <button
              onClick={() => { setText(''); setError(''); }}
              className="text-base font-semibold text-gray-500 hover:text-gray-700 transition"
            >
              {t.custom.clear}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-base font-semibold mb-4">
            {error}
          </div>
        )}

        {/* Панель длинная — держим кнопки на виду, чтобы не искать их прокруткой */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-2 -mx-1 px-1 pb-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {t.custom.cancel}
          </button>
          <button
            onClick={apply}
            disabled={!sentences.length}
            className="flex-1 py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition disabled:opacity-50"
          >
            {t.custom.read}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTextPanel;
