import { getConsonants, getVowels } from '../../shared/utils/orthography';
import { useLanguage } from '../../shared/i18n/LanguageContext';
import { ShuffleIcon, FilterIcon, CarIcon } from '../../shared/components/Icons';
import { MODE, SYLLABLE_ORDER } from './constants';

/**
 * A multi-select grid of letters with "select all" / "clear" controls.
 * An empty selection means "all letters".
 */
const LetterGrid = ({ title, letters, selected, onToggle, onSelectAll, onClear, t, fill }) => (
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
          {t.menu.all}
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-lg text-base font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          {t.menu.clear}
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
        ? fill(t.menu.selected, { n: selected.length })
        : t.menu.nothingSelected}
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
 *
 * Буквы и подписи берутся из языка, выбранного на главной странице.
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
  onStartMode,
  onGoHome
}) => {
  const { lang, t, fill } = useLanguage();
  const consonants = getConsonants(lang);
  const vowels = getVowels(lang);

  const orderButton = (order, label, example) => (
    <button
      onClick={() => onSyllableOrderChange(order)}
      className={`px-8 py-4 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 ${
        syllableOrder === order
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
    >
      {label}<br/>
      <span className="text-3xl">{example}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        {/* Назад на главную — там же меняется язык обучения */}
        <button
          onClick={onGoHome}
          className="mb-4 px-4 py-2 rounded-lg text-base font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          ← {t.menu.home}
        </button>

        <h1 className="text-5xl font-bold text-center mb-8 text-purple-600">
          {t.menu.title} 📚
        </h1>

        {/* Syllable Order Selection */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          {orderButton(SYLLABLE_ORDER.CV, t.menu.orderCV, 'БА')}
          {orderButton(SYLLABLE_ORDER.VC, t.menu.orderVC, 'АБ')}
          {orderButton(SYLLABLE_ORDER.MIXED, t.menu.orderMixed, 'БА · АБ')}
        </div>

        {/* Consonant Selection Grid */}
        <LetterGrid
          title={t.menu.consonants}
          letters={consonants}
          selected={selectedConsonants}
          onToggle={onToggleConsonant}
          onSelectAll={onSelectAllConsonants}
          onClear={onClearConsonants}
          t={t}
          fill={fill}
        />

        {/* Vowel Selection Grid */}
        <LetterGrid
          title={t.menu.vowels}
          letters={vowels}
          selected={selectedVowels}
          onToggle={onToggleVowel}
          onSelectAll={onSelectAllVowels}
          onClear={onClearVowels}
          t={t}
          fill={fill}
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
            {t.menu.softSign}
          </button>
          <p className="text-center text-gray-500 text-base">
            {t.menu.softSignHint}
            <br />
            {t.menu.softSignOrderHint}
          </p>
        </div>

        {/* Start Buttons */}
        <div className="mb-4 space-y-4">
          <button
            onClick={() => onStartMode(MODE.RANDOM)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-3xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-4"
          >
            <ShuffleIcon />
            {t.menu.startRandom}
          </button>
          <button
            onClick={() => onStartMode(MODE.GAME_3D)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-8 text-3xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-4"
          >
            <CarIcon className="text-4xl" />
            {t.menu.game3d}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-600 text-lg">
          💡 {t.menu.spaceHint.split('{key}')[0]}
          <kbd className="px-3 py-1 bg-gray-200 rounded">{t.menu.spaceKey}</kbd>
          {t.menu.spaceHint.split('{key}')[1]}
        </div>
      </div>
    </div>
  );
};

export default SyllablesMenu;
