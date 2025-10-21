import { SoundOnIcon, SoundOffIcon, PaletteIcon, MenuIcon } from '../../shared/components/Icons';
import { BACKGROUNDS } from './constants';

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
  selectedConsonant,
  onToggleSound,
  onChangeBg,
  onToggleCase,
  onShowMenu,
  onNextSyllable
}) => {
  const background = BACKGROUNDS[bgIndex];

  const formatSyllableChar = (char, index) => {
    const formattedChar = isUpperCase ? char.toUpperCase() : char;

    // For CV order: consonant is blue, vowel is red
    // For VC order: vowel is red, consonant is blue
    const isFirstCharConsonant = syllableOrder === 'cv';
    const colorClass = index === 0
      ? (isFirstCharConsonant
          ? (background.value === 'bg-gray-900' ? 'text-blue-400' : 'text-blue-600')
          : (background.value === 'bg-gray-900' ? 'text-red-400' : 'text-red-600'))
      : (isFirstCharConsonant
          ? (background.value === 'bg-gray-900' ? 'text-red-400' : 'text-red-600')
          : (background.value === 'bg-gray-900' ? 'text-blue-400' : 'text-blue-600'));

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

      {/* Selected Consonant Display (if in selected mode) */}
      {selectedConsonant && (
        <div
          className={`absolute top-2 left-2 md:top-6 md:left-6 rounded-full px-3 py-2 md:px-6 md:py-3 shadow-lg ${
            background.value === 'bg-gray-900' ? 'bg-white' : 'bg-gray-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={`text-lg md:text-2xl font-bold ${
            background.value === 'bg-gray-900' ? 'text-gray-900' : 'text-white'
          }`}>
            {selectedConsonant.toUpperCase()} {selectedConsonant}
          </span>
        </div>
      )}

      {/* Main Syllable Display */}
      <div
        className={`transition-all duration-150 ${animate ? 'scale-75 opacity-0' : 'scale-100 opacity-100'} w-full flex justify-center pointer-events-none`}
      >
        <div
          className={`font-bold ${background.text} select-none leading-none`}
          style={{ fontSize: '45vw' }}
        >
          {currentSyllable && currentSyllable.split('').map((char, index) =>
            formatSyllableChar(char, index)
          )}
        </div>
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
