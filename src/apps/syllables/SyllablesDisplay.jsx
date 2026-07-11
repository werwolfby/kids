import { SoundOnIcon, SoundOffIcon, PaletteIcon, MenuIcon, BookIcon } from '../../shared/components/Icons';
import { BACKGROUNDS } from './constants';
import { isConsonant } from '../../shared/utils/russianOrthography';
import { getChistogovorka } from './chistogovorki';
import { getWordForSyllable } from './words';

/**
 * Renders a word with the given syllable highlighted (bold, uppercase, accent).
 */
const SyllableInWord = ({ word, syllable, isDark }) => {
  const idx = word.toLowerCase().indexOf(syllable.toLowerCase());
  if (idx === -1) return <>{word}</>;

  const before = word.slice(0, idx);
  const match = word.slice(idx, idx + syllable.length);
  const after = word.slice(idx + syllable.length);

  return (
    <>
      {before}
      <span className={`font-extrabold uppercase ${isDark ? 'text-yellow-300' : 'text-pink-600'}`}>
        {match}
      </span>
      {after}
    </>
  );
};

/**
 * SyllablesDisplay Component
 *
 * Displays the current syllable in large format with controls for:
 * - Sound on/off
 * - Background color change
 * - Case (uppercase/lowercase) toggle
 * - Return to menu
 */
const SyllablesDisplay = ({
  currentSyllable,
  syllableOrder,
  count,
  animate,
  soundEnabled,
  bgIndex,
  isUpperCase,
  selectedConsonants,
  selectedVowels,
  softSign,
  showHints,
  onToggleSound,
  onChangeBg,
  onToggleCase,
  onToggleHints,
  onShowMenu,
  onNextSyllable
}) => {
  const background = BACKGROUNDS[bgIndex];
  const isDark = background.value === 'bg-gray-900';
  const rhyme = getChistogovorka(currentSyllable);
  // Fall back to a sample word (with the syllable highlighted) when no rhyme exists.
  const sampleWord = rhyme ? null : getWordForSyllable(currentSyllable);

  const formatSyllableChar = (char, index) => {
    const formattedChar = isUpperCase ? char.toUpperCase() : char;

    // Color by letter type so it stays correct for CV, VC, and mixed orders:
    // consonants are blue, vowels are red.
    const isDark = background.value === 'bg-gray-900';
    const colorClass = isConsonant(char)
      ? (isDark ? 'text-blue-400' : 'text-blue-600')
      : (isDark ? 'text-red-400' : 'text-red-600');

    return <span key={index} className={colorClass}>{formattedChar}</span>;
  };

  return (
    <div
      className={`min-h-screen ${background.value} flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 overflow-hidden`}
      onClick={onNextSyllable}
    >
      {/* Top Controls */}
      <div
        className="absolute top-2 right-2 md:top-6 md:right-6 flex gap-2 md:gap-4 flex-wrap justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Counter */}
        <div className={`bg-opacity-80 ${background.value === 'bg-gray-900' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-lg md:text-2xl font-bold`}>
          {count}
        </div>

        {/* Case Toggle */}
        <button
          onClick={onToggleCase}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            background.value === 'bg-gray-900' ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
          title="Переключить регистр"
        >
          {isUpperCase ? 'АБ' : 'аб'}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            soundEnabled
              ? 'bg-green-500 text-white'
              : background.value === 'bg-gray-900' ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>

        {/* Hints (чистоговорки / слова) Toggle */}
        <button
          onClick={onToggleHints}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            showHints
              ? 'bg-green-500 text-white'
              : background.value === 'bg-gray-900' ? 'bg-white text-gray-700' : 'bg-gray-900 text-white'
          }`}
          title={showHints ? 'Скрыть подсказки' : 'Показать подсказки'}
        >
          <BookIcon />
        </button>

        {/* Background Color Toggle */}
        <button
          onClick={onChangeBg}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            background.value === 'bg-gray-900' ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
          title="Сменить фон"
        >
          <PaletteIcon />
        </button>

        {/* Menu Button */}
        <button
          onClick={onShowMenu}
          className={`rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg text-base md:text-xl font-bold transition ${
            background.value === 'bg-gray-900' ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
          title="Меню"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Selected letters / soft sign (if practising a specific set) */}
      {((selectedConsonants && selectedConsonants.length > 0) ||
        (selectedVowels && selectedVowels.length > 0) ||
        softSign) && (
        <div
          className={`absolute top-2 left-2 md:top-6 md:left-6 rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-lg max-w-[60vw] space-y-1 ${
            background.value === 'bg-gray-900' ? 'bg-white' : 'bg-gray-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedConsonants && selectedConsonants.length > 0 && (
            <div className={`text-base md:text-2xl font-bold ${
              background.value === 'bg-gray-900' ? 'text-blue-600' : 'text-blue-400'
            }`}>
              {selectedConsonants.map(c => c.toUpperCase()).join(' ')}
            </div>
          )}
          {((selectedVowels && selectedVowels.length > 0) || softSign) && (
            <div className={`text-base md:text-2xl font-bold ${
              background.value === 'bg-gray-900' ? 'text-red-600' : 'text-red-400'
            }`}>
              {[...(selectedVowels || []), ...(softSign ? ['ь'] : [])]
                .map(v => v.toUpperCase()).join(' ')}
            </div>
          )}
        </div>
      )}

      {/* Main Syllable Display (framed) + чистоговорка */}
      <div
        className={`transition-all duration-150 ${animate ? 'scale-75 opacity-0' : 'scale-100 opacity-100'} w-full flex flex-col items-center pointer-events-none px-4`}
      >
        <div
          className={`rounded-[2.5rem] md:rounded-[4rem] border-4 md:border-8 shadow-2xl px-6 md:px-16 py-2 md:py-6 ${
            background.value === 'bg-gray-900'
              ? 'border-gray-500 bg-white/5'
              : 'border-purple-300 bg-purple-500/5'
          }`}
        >
          <div
            className={`font-bold ${background.text} select-none leading-none`}
            style={{ fontSize: 'min(34vw, 52vh)' }}
          >
            {currentSyllable && currentSyllable.split('').map((char, index) =>
              formatSyllableChar(char, index)
            )}
          </div>
        </div>

        {/* Чистоговорка, либо слово-пример с выделенным слогом (мелким шрифтом) */}
        {showHints && (rhyme || sampleWord) && (
          <p
            className={`mt-4 md:mt-8 max-w-[90vw] text-center font-semibold leading-snug text-lg md:text-3xl ${
              isDark ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {rhyme
              ? rhyme
              : <SyllableInWord word={sampleWord} syllable={currentSyllable} isDark={isDark} />}
          </p>
        )}
      </div>

      {/* Bottom Instructions */}
      <div
        className={`absolute bottom-4 md:bottom-8 text-sm md:text-xl font-semibold rounded-full px-4 py-2 md:px-8 md:py-4 ${
          background.value === 'bg-gray-900' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
        } bg-opacity-80`}
        onClick={(e) => e.stopPropagation()}
      >
        Нажми ПРОБЕЛ или экран для следующего слога
      </div>
    </div>
  );
};

export default SyllablesDisplay;
