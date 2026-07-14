import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { popularWords } from './wordsData';
import { isVowel } from '../../shared/utils/russianOrthography';
import { BACKGROUNDS } from '../syllables/constants';
import { speak, cancelSpeech } from '../../shared/utils/speech';
import { SoundOnIcon, SoundOffIcon, PaletteIcon, MenuIcon, ShuffleIcon } from '../../shared/components/Icons';

/**
 * PopularWordsApp
 *
 * «Учим популярные слова» — reads the 1000 most common Russian words in
 * frequency order, each split into «склады» (max two letters): мо-я, я-ко-рь.
 */
const PopularWordsApp = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [shuffle, setShuffle] = useState(false);   // вперемешку vs по порядку
  const [showDashes, setShowDashes] = useState(true);
  const [history, setHistory] = useState([]);       // для «назад» в режиме вперемешку

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

  const dashedWord = popularWords[index];
  const warehouses = dashedWord.split('-');
  const plainWord = dashedWord.replace(/-/g, '');

  // Speak the whole word (without dashes)
  const speakWord = useCallback((word) => {
    speak(word, { rate: 0.8, pitch: 1.1 });
  }, []);

  const goTo = useCallback((nextIndex) => {
    const len = hi - lo + 1;
    const wrapped = lo + (((nextIndex - lo) % len) + len) % len; // wrap inside [lo, hi]
    setAnimate(true);
    setTimeout(() => {
      setIndex(wrapped);
      setAnimate(false);
    }, 120);
  }, [lo, hi]);

  const randomIndex = useCallback(() => {
    const len = hi - lo + 1;
    if (len <= 1) return lo;
    let r;
    do { r = lo + Math.floor(Math.random() * len); } while (r === index);
    return r;
  }, [lo, hi, index]);

  const next = useCallback(() => {
    if (shuffle) {
      setHistory(h => [...h, index]);
      goTo(randomIndex());
    } else {
      goTo(index + 1);
    }
  }, [shuffle, goTo, index, randomIndex]);

  const prev = useCallback(() => {
    if (shuffle) {
      if (history.length === 0) { goTo(randomIndex()); return; }
      const last = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      goTo(last);
    } else {
      goTo(index - 1);
    }
  }, [shuffle, history, goTo, index, randomIndex]);

  const toggleShuffle = () => {
    setHistory([]);
    setShuffle(s => !s);
  };

  // Apply a word range as boundaries [f, t), clamped (at least 1 word).
  const applyRangeValues = (f, t) => {
    f = Math.min(Math.max(f, 0), total - 1);
    t = Math.min(Math.max(t, f + 1), total);
    setRangeFrom(f);
    setRangeTo(t);
    setHistory([]);
    setIndex(f);
    setShowRange(false);
  };

  const applyDraft = () => applyRangeValues(draftFrom, draftTo);

  const openRange = () => {
    setDraftFrom(rangeFrom);
    setDraftTo(rangeTo);
    setShowRange(true);
  };

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

  // Consonants blue, vowels red (as in the syllables app).
  const charColor = (ch) => isVowel(ch)
    ? (isDark ? 'text-red-400' : 'text-red-600')
    : (isDark ? 'text-blue-400' : 'text-blue-600');
  const fmt = (s) => (isUpperCase ? s.toUpperCase() : s);

  // Scale font down for longer words so they stay on one line
  const displayLen = dashedWord.length;
  const fontVw = Math.max(7, Math.min(20, Math.floor(170 / displayLen)));

  const controlBtn = `rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
    isDark ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
  }`;

  return (
    <div
      className={`min-h-screen ${background.value} flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 overflow-hidden`}
      onClick={next}
    >
      {/* Top Controls */}
      <div
        className="absolute top-2 right-2 md:top-6 md:right-6 flex gap-2 md:gap-4 flex-wrap justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-opacity-80 ${isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-lg md:text-2xl font-bold`}>
          {index + 1} / {total}
        </div>

        {/* Диапазон слов */}
        <button
          onClick={openRange}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            rangeFrom === 0 && rangeTo === total
              ? (isDark ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800')
              : 'bg-green-500 text-white'
          }`}
          title="Выбрать диапазон слов"
        >
          {rangeFrom}–{rangeTo}
        </button>

        <button onClick={() => setIsUpperCase(!isUpperCase)} className={controlBtn} title="Переключить регистр">
          {isUpperCase ? 'АБ' : 'аб'}
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            soundEnabled ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>

        {/* Вперемешку / по порядку */}
        <button
          onClick={toggleShuffle}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            shuffle ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={shuffle ? 'Вперемешку (нажми — по порядку)' : 'По порядку (нажми — вперемешку)'}
        >
          <ShuffleIcon width={22} height={22} />
        </button>

        {/* Показать / скрыть дефисы */}
        <button
          onClick={() => setShowDashes(d => !d)}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-lg md:text-2xl font-bold leading-none transition ${
            showDashes ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={showDashes ? 'Скрыть дефисы' : 'Показать дефисы'}
        >
          а‑б
        </button>

        <button onClick={() => setBgIndex((bgIndex + 1) % BACKGROUNDS.length)} className={controlBtn} title="Сменить фон">
          <PaletteIcon />
        </button>

        <button onClick={() => navigate('/')} className={controlBtn} title="В меню">
          <MenuIcon />
        </button>
      </div>

      {/* Prev / Next arrows — bottom corners on mobile, centred sides on desktop */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className={`absolute z-10 left-3 bottom-20 md:left-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full w-12 h-12 md:w-20 md:h-20 shadow-lg text-3xl md:text-5xl font-bold transition ${
          isDark ? 'bg-white/80 text-gray-800 hover:bg-white' : 'bg-gray-900/70 text-white hover:bg-gray-900'
        }`}
        title="Предыдущее слово"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className={`absolute z-10 right-3 bottom-20 md:right-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full w-12 h-12 md:w-20 md:h-20 shadow-lg text-3xl md:text-5xl font-bold transition ${
          isDark ? 'bg-white/80 text-gray-800 hover:bg-white' : 'bg-gray-900/70 text-white hover:bg-gray-900'
        }`}
        title="Следующее слово"
      >
        ›
      </button>

      {/* Word Card (framed, warehouses separated) */}
      <div
        className={`transition-all duration-150 ${animate ? 'scale-90 opacity-0' : 'scale-100 opacity-100'} w-full flex justify-center pointer-events-none px-4`}
      >
        <div
          className={`rounded-[2.5rem] md:rounded-[4rem] border-4 md:border-8 shadow-2xl px-6 md:px-16 py-4 md:py-10 ${
            isDark ? 'border-gray-500 bg-white/5' : 'border-purple-300 bg-purple-500/5'
          }`}
        >
          <div
            className="font-bold select-none leading-none whitespace-nowrap flex items-baseline"
            style={{ fontSize: `min(${fontVw}vw, 26vh)` }}
          >
            {warehouses.map((wh, i) => (
              <span key={i} className="flex items-baseline">
                {i > 0 && showDashes && (
                  <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'} px-[0.05em]`}>-</span>
                )}
                {wh.split('').map((ch, ci) => (
                  <span key={ci} className={charColor(ch)}>{fmt(ch)}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Instructions */}
      <div
        className={`absolute bottom-4 md:bottom-8 text-sm md:text-xl font-semibold rounded-full px-4 py-2 md:px-8 md:py-4 ${
          isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
        } bg-opacity-80`}
        onClick={(e) => e.stopPropagation()}
      >
        ПРОБЕЛ или экран — дальше · ← → листать
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
              Диапазон слов
            </h2>

            {/* Live readout */}
            <div className="text-center mb-4">
              <div className="text-4xl font-extrabold text-gray-800">
                {draftFrom} – {draftTo}
              </div>
              <div className="text-gray-500 text-lg">{draftTo - draftFrom} слов из {total}</div>
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
                aria-label="Начало диапазона"
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
                aria-label="Конец диапазона"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => applyRangeValues(0, total)}
                className="px-4 py-2 rounded-lg text-base font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
              >
                Все {total}
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
                Отмена
              </button>
              <button
                onClick={applyDraft}
                className="flex-1 py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularWordsApp;
