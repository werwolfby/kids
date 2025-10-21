import { consonants } from '../../shared/utils/russianOrthography';
import { ShuffleIcon, FilterIcon, CarIcon } from '../../shared/components/Icons';
import { MODE, SYLLABLE_ORDER } from './constants';

/**
 * SyllablesMenu Component
 *
 * Main menu for the syllables app where users can:
 * - Choose between CV (consonant-vowel) and VC (vowel-consonant) order
 * - Start random syllables mode
 * - Start 3D game mode
 * - Select a specific consonant to practice
 */
const SyllablesMenu = ({ syllableOrder, onSyllableOrderChange, onStartMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-center mb-8 text-purple-600">
          Учим слоги! 📚
        </h1>

        {/* Syllable Order Selection */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => onSyllableOrderChange(SYLLABLE_ORDER.CV)}
            className={`px-8 py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
              syllableOrder === SYLLABLE_ORDER.CV
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Согласная + Гласная<br/>
            <span className="text-3xl">БА</span>
          </button>
          <button
            onClick={() => onSyllableOrderChange(SYLLABLE_ORDER.VC)}
            className={`px-8 py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
              syllableOrder === SYLLABLE_ORDER.VC
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Гласная + Согласная<br/>
            <span className="text-3xl">АБ</span>
          </button>
        </div>

        {/* Mode Selection Buttons */}
        <div className="mb-8 space-y-4">
          <button
            onClick={() => onStartMode(MODE.RANDOM)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-3xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-4"
          >
            <ShuffleIcon />
            Случайные слоги
          </button>
          <button
            onClick={() => onStartMode(MODE.GAME_3D)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-8 text-3xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-4"
          >
            <CarIcon className="text-4xl" />
            3D Игра
          </button>
        </div>

        {/* Consonant Selection Grid */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FilterIcon />
            Выбери букву:
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {consonants.map(consonant => (
              <button
                key={consonant}
                onClick={() => onStartMode(MODE.SELECTED, consonant)}
                className="bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-xl p-1 text-3xl font-bold hover:shadow-lg transition-all transform hover:scale-110 flex flex-col items-center justify-center gap-1"
              >
                <span>{consonant.toUpperCase()}</span>
                <span className="text-2xl">{consonant}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-600 text-lg">
          💡 Нажимай <kbd className="px-3 py-1 bg-gray-200 rounded">Пробел</kbd> для следующего слога
        </div>
      </div>
    </div>
  );
};

export default SyllablesMenu;
