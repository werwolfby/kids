import { consonants, vowels } from '../../shared/utils/russianOrthography';
import { ShuffleIcon, FilterIcon, CarIcon } from '../../shared/components/Icons';
import { MODE, SYLLABLE_ORDER } from './constants';

/**
 * A multi-select grid of letters with "select all" / "clear" controls.
 * An empty selection means "all letters".
 */
const LetterGrid = ({ title, letters, selected, onToggle, onSelectAll, onClear }) => (
  <div className="mb-6">
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
        <FilterIcon />
        {title}
      </h2>
      <div className="flex gap-2">
        <button
          onClick={onSelectAll}
          className="px-4 py-2 rounded-lg text-base font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Все
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-lg text-base font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Сбросить
        </button>
      </div>
    </div>
    <div className="grid grid-cols-5 gap-3">
      {letters.map(letter => {
        const isSelected = selected.includes(letter);
        return (
          <button
            key={letter}
            onClick={() => onToggle(letter)}
            className={`rounded-xl p-1 text-3xl font-bold transition-all transform hover:scale-110 flex flex-col items-center justify-center gap-1 ${
              isSelected
                ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white shadow-lg ring-4 ring-yellow-400'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <span>{letter.toUpperCase()}</span>
            <span className="text-2xl">{letter}</span>
          </button>
        );
      })}
    </div>
    <p className="mt-3 text-center text-gray-500 text-base">
      {selected.length > 0
        ? `Выбрано: ${selected.length}`
        : 'Ничего не выбрано — будут все буквы'}
    </p>
  </div>
);

/**
 * SyllablesMenu Component
 *
 * Main menu for the syllables app where users can:
 * - Choose between CV / VC / mixed order
 * - Pick sets of consonants and vowels to practise (empty = all)
 * - Optionally include soft-sign syllables (СОГ + Ь, CV order only)
 * - Start random syllables mode or the 3D game with those settings
 */
const SyllablesMenu = ({
  syllableOrder,
  onSyllableOrderChange,
  selectedConsonants,
  onToggleConsonant,
  onClearConsonants,
  onSelectAllConsonants,
  selectedVowels,
  onToggleVowel,
  onClearVowels,
  onSelectAllVowels,
  softSign,
  onToggleSoftSign,
  onStartMode
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-center mb-8 text-purple-600">
          Учим слоги! 📚
        </h1>

        {/* Syllable Order Selection */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
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
          <button
            onClick={() => onSyllableOrderChange(SYLLABLE_ORDER.MIXED)}
            className={`px-8 py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
              syllableOrder === SYLLABLE_ORDER.MIXED
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Вперемешку<br/>
            <span className="text-3xl">БА · АБ</span>
          </button>
        </div>

        {/* Consonant Selection Grid */}
        <LetterGrid
          title="Согласные:"
          letters={consonants}
          selected={selectedConsonants}
          onToggle={onToggleConsonant}
          onSelectAll={onSelectAllConsonants}
          onClear={onClearConsonants}
        />

        {/* Vowel Selection Grid */}
        <LetterGrid
          title="Гласные:"
          letters={vowels}
          selected={selectedVowels}
          onToggle={onToggleVowel}
          onSelectAll={onSelectAllVowels}
          onClear={onClearVowels}
        />

        {/* Soft Sign Toggle — lives with the vowels because Ь occupies the same
            (second) position in a syllable, but only after a consonant. */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <button
            onClick={onToggleSoftSign}
            className={`px-6 py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 flex items-center gap-3 ${
              softSign
                ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white shadow-lg ring-4 ring-yellow-400'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <span className="text-3xl">{softSign ? '☑' : '☐'}</span>
            Слоги с мягким знаком (Ь)
          </button>
          <p className="text-center text-gray-500 text-base">
            «Ь» ставится только после согласной — например НЬ, ТЬ, СЬ
            <br />
            (работает в порядке «Согласная + Гласная»)
          </p>
        </div>

        {/* Start Buttons */}
        <div className="mb-4 space-y-4">
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

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-600 text-lg">
          💡 Нажимай <kbd className="px-3 py-1 bg-gray-200 rounded">Пробел</kbd> для следующего слога
        </div>
      </div>
    </div>
  );
};

export default SyllablesMenu;
