import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sentenceLevels, allSentences } from './sentencesData';
import { splitToWarehouses } from '../../shared/utils/syllableSplit';
import { isVowel } from '../../shared/utils/russianOrthography';
import { BACKGROUNDS } from '../syllables/constants';
import { speak, cancelSpeech } from '../../shared/utils/speech';
import { SoundOnIcon, SoundOffIcon, PaletteIcon, MenuIcon, ShuffleIcon } from '../../shared/components/Icons';

/**
 * SentencesApp
 *
 * «Учим предложения» — reads short, graded Russian sentences. Every word is
 * split into «склады» (max two letters) with the shared syllableSplit util.
 */
const SentencesApp = () => {
  const navigate = useNavigate();
  const [levelIndex, setLevelIndex] = useState(0); // 0-based, or null = все уровни
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [showDashes, setShowDashes] = useState(true);
  // История просмотра (как в браузере): список показанных индексов + позиция.
  const [history, setHistory] = useState([0]);
  const [histPos, setHistPos] = useState(0);
  const [showLevels, setShowLevels] = useState(false);

  const sentences = levelIndex === null ? allSentences : sentenceLevels[levelIndex].sentences;
  const total = sentences.length;

  const background = BACKGROUNDS[bgIndex];
  const isDark = background.value === 'bg-gray-900';

  const sentence = sentences[Math.min(index, total - 1)];
  const words = sentence.split(' ');

  const speakSentence = useCallback((text) => {
    speak(text, { rate: 0.85, pitch: 1.1 });
  }, []);

  const randomIndex = useCallback(() => {
    if (total <= 1) return 0;
    let r;
    do { r = Math.floor(Math.random() * total); } while (r === index);
    return r;
  }, [total, index]);

  // Показать предложение по индексу, обновив историю просмотра.
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
  // показываем новое предложение (случайное или следующее по порядку).
  const next = useCallback(() => {
    if (histPos < history.length - 1) {
      const pos = histPos + 1;
      showAt(history[pos], history, pos);
    } else {
      const newIndex = shuffle ? randomIndex() : (index + 1) % total;
      const hist = [...history, newIndex];
      showAt(newIndex, hist, hist.length - 1);
    }
  }, [histPos, history, shuffle, randomIndex, index, total, showAt]);

  // Назад: всегда возвращает к реально показанному ранее предложению
  // (и в режиме «по порядку», и «вперемешку»). Нет предыдущего — ничего.
  const prev = useCallback(() => {
    if (histPos > 0) {
      const pos = histPos - 1;
      showAt(history[pos], history, pos);
    }
  }, [histPos, history, showAt]);

  const toggleShuffle = () => {
    setHistory([index]);
    setHistPos(0);
    setShuffle(s => !s);
  };

  const chooseLevel = (li) => {
    setLevelIndex(li);
    setIndex(0);
    setHistory([0]);
    setHistPos(0);
    setShowLevels(false);
  };

  // Auto-speak the current sentence when it changes (if sound is on)
  useEffect(() => {
    if (soundEnabled) speakSentence(sentence);
    return () => cancelSpeech();
  }, [index, levelIndex, soundEnabled, sentence, speakSentence]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (showLevels) {
        if (e.code === 'Escape') setShowLevels(false);
        return;
      }
      if (e.code === 'Space' || e.code === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.code === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, navigate, showLevels]);

  // Consonants blue, vowels red (as in the syllables app).
  const charColor = (ch) => isVowel(ch)
    ? (isDark ? 'text-red-400' : 'text-red-600')
    : (isDark ? 'text-blue-400' : 'text-blue-600');
  const fmt = (s) => (isUpperCase ? s.toUpperCase() : s);

  // Font size tiers by sentence length (it wraps if still too long)
  const len = sentence.length;
  const fontSize =
    len <= 12 ? 'clamp(2.5rem, 13vw, 7rem)'
      : len <= 22 ? 'clamp(2rem, 10vw, 5.5rem)'
        : len <= 34 ? 'clamp(1.6rem, 8vw, 4.5rem)'
          : 'clamp(1.3rem, 6.5vw, 3.5rem)';

  const controlBtn = `rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
    isDark ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
  }`;
  const toggleBtn = (on) => `rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
    on ? 'bg-green-500 text-white' : isDark ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
  }`;

  const currentLevel = levelIndex === null ? null : sentenceLevels[levelIndex];

  return (
    <div
      className={`min-h-screen ${background.value} flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 overflow-hidden pt-20 pb-32 md:pt-20 md:pb-24`}
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

        {/* Level picker */}
        <button
          onClick={() => setShowLevels(true)}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            levelIndex === null ? (isDark ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800') : 'bg-green-500 text-white'
          }`}
          title="Выбрать уровень"
        >
          {currentLevel ? `Ур. ${currentLevel.id}` : 'Все'}
        </button>

        <button onClick={() => setIsUpperCase(!isUpperCase)} className={controlBtn} title="Переключить регистр">
          {isUpperCase ? 'АБ' : 'аб'}
        </button>

        <button onClick={() => setSoundEnabled(!soundEnabled)} className={toggleBtn(soundEnabled)} title={soundEnabled ? 'Выключить звук' : 'Включить звук'}>
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>

        <button onClick={toggleShuffle} className={toggleBtn(shuffle)} title={shuffle ? 'Вперемешку (нажми — по порядку)' : 'По порядку (нажми — вперемешку)'}>
          <ShuffleIcon width={22} height={22} />
        </button>

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

      {/* Prev / Next arrows — bottom corners on mobile (so they don't cover the
          sentence card), vertically-centred sides on desktop. */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className={`absolute z-10 left-3 bottom-20 md:left-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full w-12 h-12 md:w-20 md:h-20 shadow-lg text-3xl md:text-5xl font-bold transition ${
          isDark ? 'bg-white/80 text-gray-800 hover:bg-white' : 'bg-gray-900/70 text-white hover:bg-gray-900'
        }`}
        title="Предыдущее"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className={`absolute z-10 right-3 bottom-20 md:right-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full w-12 h-12 md:w-20 md:h-20 shadow-lg text-3xl md:text-5xl font-bold transition ${
          isDark ? 'bg-white/80 text-gray-800 hover:bg-white' : 'bg-gray-900/70 text-white hover:bg-gray-900'
        }`}
        title="Следующее"
      >
        ›
      </button>

      {/* Sentence Card */}
      <div
        className={`transition-all duration-150 ${animate ? 'scale-90 opacity-0' : 'scale-100 opacity-100'} w-full flex justify-center pointer-events-none px-4`}
      >
        <div
          className={`rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 shadow-2xl px-6 md:px-14 py-6 md:py-10 max-w-[92vw] ${
            isDark ? 'border-gray-500 bg-white/5' : 'border-purple-300 bg-purple-500/5'
          }`}
        >
          <div
            className="font-bold select-none flex flex-wrap justify-center items-baseline gap-x-[0.45em] gap-y-2 leading-tight"
            style={{ fontSize }}
          >
            {words.map((word, wi) => (
              <span key={wi} className="inline-flex items-baseline">
                {splitToWarehouses(word).map((wh, i) => (
                  <span key={i} className="inline-flex items-baseline">
                    {i > 0 && showDashes && (
                      <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'} px-[0.03em]`}>-</span>
                    )}
                    {wh.split('').map((ch, ci) => (
                      <span key={ci} className={charColor(ch)}>{fmt(ch)}</span>
                    ))}
                  </span>
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

      {/* Level picker panel */}
      {showLevels && (
        <div
          className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setShowLevels(false); }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-purple-600 text-center mb-6">
              Уровень сложности
            </h2>

            <div className="space-y-3 mb-4">
              {sentenceLevels.map((lvl, li) => (
                <button
                  key={lvl.id}
                  onClick={() => chooseLevel(li)}
                  className={`w-full text-left rounded-2xl p-4 transition border-2 ${
                    levelIndex === li
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-800 flex items-center justify-between">
                    {lvl.title}
                    <span className="text-sm font-semibold text-gray-400">{lvl.sentences.length}</span>
                  </div>
                  <div className="text-gray-500">{lvl.hint}</div>
                </button>
              ))}

              <button
                onClick={() => chooseLevel(null)}
                className={`w-full text-left rounded-2xl p-4 transition border-2 ${
                  levelIndex === null ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-xl font-bold text-gray-800 flex items-center justify-between">
                  Все уровни
                  <span className="text-sm font-semibold text-gray-400">{allSentences.length}</span>
                </div>
                <div className="text-gray-500">Все предложения подряд</div>
              </button>
            </div>

            <button
              onClick={() => setShowLevels(false)}
              className="w-full py-3 rounded-xl text-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentencesApp;
