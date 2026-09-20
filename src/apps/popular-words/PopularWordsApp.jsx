import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPopularWords } from './wordsData';
import { splitToWarehouses } from '../../shared/utils/syllableSplit';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { BACKGROUNDS } from '../syllables/constants';
import { speak, cancelSpeech } from '../../shared/utils/speech';
import ReadingText from '../../shared/components/ReadingText';
import { SoundOnIcon, SoundOffIcon, PaletteIcon, MenuIcon, ShuffleIcon, FingerIcon } from '../../shared/components/Icons';

/**
 * PopularWordsApp
 *
 * «Учим популярные слова» — reads the 1000 most common words of the chosen
 * language in frequency order, each split into «склады» (max two letters):
 * мо-я, я-ко-рь. Правила разбивки зависят от языка (ДЗ, ДЖ, Ў, апостроф).
 */
const PopularWordsApp = () => {
  const navigate = useNavigate();
  const { lang, t, fill } = useLanguage();
  const popularWords = getPopularWords(lang);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [shuffle, setShuffle] = useState(false);   // вперемешку vs по порядку
  const [showDashes, setShowDashes] = useState(true);
  const [tracking, setTracking] = useState(false); // ползунок: ведём пальчиком по буквам
  // История просмотра (как в браузере): список показанных индексов + позиция.
  const [history, setHistory] = useState([0]);
  const [histPos, setHistPos] = useState(0);

  const total = popularWords.length;
  // Активный диапазон как границы 0..total: изучаются слова с индексами [from, to).
  // По умолчанию — весь список (0 … 1000).
  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(total);
  const [showRange, setShowRange] = useState(false);
  const [draftFrom, setDraftFrom] = useState(0);
  const [draftTo, setDraftTo] = useState(total);

  const lo = rangeFrom;      // 0-based нижняя граница (включительно)
  const hi = rangeTo - 1;    // 0-based верхняя граница (включительно)

  const background = BACKGROUNDS[bgIndex];
  const isDark = background.value === 'bg-gray-900';

  // Индекс может «повиснуть» за границей (например, после смены языка).
  const safeIndex = Math.min(index, total - 1);
  const plainWord = popularWords[safeIndex];
  const warehouses = splitToWarehouses(plainWord, lang);

  // Speak the whole word (without dashes), in the chosen language
  const speakWord = useCallback((word) => {
    speak(word, { rate: 0.8, pitch: 1.1, lang });
  }, [lang]);

  // Палец дошёл до нового склада — проговариваем его (если звук включён).
  const speakSyllable = useCallback((syllable) => {
    if (soundEnabled) speak(syllable, { rate: 0.7, pitch: 1.2, lang });
  }, [soundEnabled, lang]);

  // Ведение пальцем по буквам не должно листать слова: если палец оторвался
  // мимо карточки, браузер шлёт click общему предку — гасим такой клик.
  const trackedAt = useRef(0);
  const noteTracking = useCallback(() => { trackedAt.current = Date.now(); }, []);

  const randomIndex = useCallback(() => {
    const len = hi - lo + 1;
    if (len <= 1) return lo;
    let r;
    do { r = lo + Math.floor(Math.random() * len); } while (r === index);
    return r;
  }, [lo, hi, index]);

  // Показать слово по индексу, обновив историю просмотра.
  const showAt = useCallback((newIndex, hist, pos) => {
    setAnimate(true);
    setTimeout(() => {
      setIndex(newIndex);
      setHistory(hist);
      setHistPos(pos);
      setAnimate(false);
    }, 120);
  }, []);

  // Вперёд: если раньше нажимали «назад» — идём вперёд по истории; иначе
  // показываем новое слово (случайное или следующее по порядку в диапазоне).
  const next = useCallback(() => {
    if (histPos < history.length - 1) {
      const pos = histPos + 1;
      showAt(history[pos], history, pos);
    } else {
      const newIndex = shuffle ? randomIndex() : (index + 1 > hi ? lo : index + 1);
      const hist = [...history, newIndex];
      showAt(newIndex, hist, hist.length - 1);
    }
  }, [histPos, history, shuffle, randomIndex, index, lo, hi, showAt]);

  // Назад: всегда возвращает к реально показанному ранее слову (в любом режиме).
  const prev = useCallback(() => {
    if (histPos > 0) {
      const pos = histPos - 1;
      showAt(history[pos], history, pos);
    }
  }, [histPos, history, showAt]);

  const clickNext = useCallback(() => {
    if (Date.now() - trackedAt.current < 400) return;
    next();
  }, [next]);

  const toggleShuffle = () => {
    setHistory([index]);
    setHistPos(0);
    setShuffle(s => !s);
  };

  // Apply a word range as boundaries [f, t), clamped (at least 1 word).
  const applyRangeValues = (f, t) => {
    f = Math.min(Math.max(f, 0), total - 1);
    t = Math.min(Math.max(t, f + 1), total);
    setRangeFrom(f);
    setRangeTo(t);
    setIndex(f);
    setHistory([f]);
    setHistPos(0);
    setShowRange(false);
  };

  const applyDraft = () => applyRangeValues(draftFrom, draftTo);

  const openRange = () => {
    setDraftFrom(rangeFrom);
    setDraftTo(rangeTo);
    setShowRange(true);
  };

  // Смена языка — начинаем список заново: слова и их количество другие.
  useEffect(() => {
    setIndex(0);
    setHistory([0]);
    setHistPos(0);
    setRangeFrom(0);
    setRangeTo(total);
  }, [lang, total]);

  // Presets in hundreds as boundaries: 0–100, 100–200, …
  const presets = [];
  for (let s = 0; s < total; s += 100) presets.push([s, Math.min(s + 100, total)]);

  // Auto-speak the current word whenever it changes (if sound is on)
  useEffect(() => {
    if (soundEnabled) {
      speakWord(plainWord);
    }
    return () => cancelSpeech();
  }, [index, soundEnabled, plainWord, speakWord]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (showRange) {
        // Panel open: only Escape (close), let inputs keep space/arrows.
        if (e.code === 'Escape') setShowRange(false);
        return;
      }
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.code === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, navigate, showRange]);

  // Scale font down for longer words so they stay on one line
  // (длина с дефисами: столько знаков реально окажется на экране)
  const displayLen = plainWord.length + warehouses.length - 1;
  const fontVw = Math.max(7, Math.min(20, Math.floor(170 / displayLen)));

  const controlBtn = `rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
    isDark ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
  }`;

  return (
    <div
      className={`min-h-screen ${background.value} flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 overflow-hidden pt-20 pb-32 md:pt-20 md:pb-24`}
      onClick={clickNext}
    >
      {/* Top Controls */}
      <div
        className="absolute top-2 right-2 md:top-6 md:right-6 flex gap-2 md:gap-4 flex-wrap justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-opacity-80 ${isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-lg md:text-2xl font-bold`}>
          {safeIndex + 1} / {total}
        </div>

        {/* Диапазон слов */}
        <button
          onClick={openRange}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            rangeFrom === 0 && rangeTo === total
              ? (isDark ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800')
              : 'bg-green-500 text-white'
          }`}
          title={t.words.rangePick}
        >
          {rangeFrom}–{rangeTo}
        </button>

        <button onClick={() => setIsUpperCase(!isUpperCase)} className={controlBtn} title={t.display.toggleCase}>
          {isUpperCase ? 'АБ' : 'аб'}
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            soundEnabled ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={soundEnabled ? t.display.soundOff : t.display.soundOn}
        >
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>

        {/* Вперемешку / по порядку */}
        <button
          onClick={toggleShuffle}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            shuffle ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={shuffle ? t.common.shuffleOn : t.common.shuffleOff}
        >
          <ShuffleIcon width={22} height={22} />
        </button>

        {/* Ползунок: ведём пальчиком по буквам */}
        <button
          onClick={() => setTracking(tr => !tr)}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            tracking ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={tracking ? t.common.trackOn : t.common.trackOff}
        >
          <FingerIcon />
        </button>

        {/* Показать / скрыть дефисы */}
        <button
          onClick={() => setShowDashes(d => !d)}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-lg md:text-2xl font-bold leading-none transition ${
            showDashes ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={showDashes ? t.common.dashesHide : t.common.dashesShow}
        >
          а‑б
        </button>

        <button onClick={() => setBgIndex((bgIndex + 1) % BACKGROUNDS.length)} className={controlBtn} title={t.display.changeBg}>
          <PaletteIcon />
        </button>

        <button onClick={() => navigate('/')} className={controlBtn} title={t.common.toMenu}>
          <MenuIcon />
        </button>
      </div>

      {/* Prev / Next arrows — bottom corners on mobile, centred sides on desktop */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className={`absolute z-10 left-3 bottom-20 md:left-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full w-12 h-12 md:w-20 md:h-20 shadow-lg text-3xl md:text-5xl font-bold transition ${
          isDark ? 'bg-white/80 text-gray-800 hover:bg-white' : 'bg-gray-900/70 text-white hover:bg-gray-900'
        }`}
        title={t.words.prev}
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className={`absolute z-10 right-3 bottom-20 md:right-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full w-12 h-12 md:w-20 md:h-20 shadow-lg text-3xl md:text-5xl font-bold transition ${
          isDark ? 'bg-white/80 text-gray-800 hover:bg-white' : 'bg-gray-900/70 text-white hover:bg-gray-900'
        }`}
        title={t.words.next}
      >
        ›
      </button>

      {/* Word Card (framed, warehouses separated) */}
      <div
        className={`transition-all duration-150 ${animate ? 'scale-90 opacity-0' : 'scale-100 opacity-100'} w-full flex justify-center px-4 ${
          tracking ? '' : 'pointer-events-none'
        }`}
      >
        <div
          className={`rounded-[2.5rem] md:rounded-[4rem] border-4 md:border-8 shadow-2xl px-6 md:px-16 py-4 md:py-10 ${
            isDark ? 'border-gray-500 bg-white/5' : 'border-purple-300 bg-purple-500/5'
          }`}
        >
          <ReadingText
            text={plainWord}
            lang={lang}
            isDark={isDark}
            isUpperCase={isUpperCase}
            showDashes={showDashes}
            fontSize={`min(${fontVw}vw, 26vh)`}
            className="leading-none whitespace-nowrap flex items-baseline"
            tracking={tracking}
            onSyllable={speakSyllable}
            onInteract={noteTracking}
            sliderLabel={t.common.trackHint}
          />
        </div>
      </div>

      {/* Bottom Instructions */}
      <div
        className={`absolute bottom-4 md:bottom-8 text-sm md:text-xl font-semibold rounded-full px-4 py-2 md:px-8 md:py-4 ${
          isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
        } bg-opacity-80`}
        onClick={(e) => e.stopPropagation()}
      >
        {tracking ? t.common.trackHint : t.common.navHint}
      </div>

      {/* Range picker panel */}
      {showRange && (
        <div
          className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setShowRange(false); }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-purple-600 text-center mb-2">
              {t.words.rangeTitle}
            </h2>

            {/* Live readout */}
            <div className="text-center mb-4">
              <div className="text-4xl font-extrabold text-gray-800">
                {draftFrom} – {draftTo}
              </div>
              <div className="text-gray-500 text-lg">{fill(t.words.count, { n: draftTo - draftFrom, total })}</div>
            </div>

            {/* Dual-thumb slider */}
            <div className="relative h-8 mb-6 px-1">
              {/* base track */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-gray-200" />
              {/* selected range */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-purple-500"
                style={{ left: `${(draftFrom / total) * 100}%`, width: `${((draftTo - draftFrom) / total) * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={total}
                step={1}
                value={draftFrom}
                onChange={(e) => setDraftFrom(Math.min(Number(e.target.value), draftTo - 1))}
                className="dual-range"
                style={{ zIndex: draftFrom > total / 2 ? 5 : 3 }}
                aria-label={t.words.rangeFrom}
              />
              <input
                type="range"
                min={0}
                max={total}
                step={1}
                value={draftTo}
                onChange={(e) => setDraftTo(Math.max(Number(e.target.value), draftFrom + 1))}
                className="dual-range"
                style={{ zIndex: 4 }}
                aria-label={t.words.rangeTo}
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => applyRangeValues(0, total)}
                className="px-4 py-2 rounded-lg text-base font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
              >
                {fill(t.words.allWords, { total })}
              </button>
              {presets.map(([f, t]) => (
                <button
                  key={f}
                  onClick={() => applyRangeValues(f, t)}
                  className="px-4 py-2 rounded-lg text-base font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  {f}–{t}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRange(false)}
                className="flex-1 py-3 rounded-xl text-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                {t.words.cancel}
              </button>
              <button
                onClick={applyDraft}
                className="flex-1 py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition"
              >
                {t.words.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularWordsApp;
