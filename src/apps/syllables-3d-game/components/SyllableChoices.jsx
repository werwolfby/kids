import { isConsonant } from '../../../shared/utils/russianOrthography';

/**
 * SyllableChoices Component
 *
 * Shows the two syllable choices at the bottom of the screen
 */
const SyllableChoices = ({ question, hasAnswered, selectedSide, syllableOrder, isUpperCase, onAnswer }) => {
  if (!question) return null;

  const formatSyllable = (syllable) => {
    if (!syllable) return '';
    const chars = syllable.split('');

    // Color by letter type (consonant = blue, vowel = red) so it stays correct
    // even in mixed mode where each syllable may be CV or VC.
    return (
      <>
        {chars.map((char, i) => (
          <span key={i} className={isConsonant(char) ? 'text-blue-400' : 'text-red-400'}>
            {isUpperCase ? char.toUpperCase() : char}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 flex pointer-events-none">
      <div
        onClick={() => !hasAnswered && onAnswer('left')}
        className={`flex-1 font-bold text-8xl py-20 transition-all pointer-events-auto flex items-center justify-center gap-4 ${
          hasAnswered
            ? (selectedSide === 'left' ? 'opacity-100' : 'opacity-0')
            : 'cursor-pointer hover:bg-white hover:bg-opacity-10'
        }`}
      >
        <span className="text-8xl font-bold text-white">←</span>
        {formatSyllable(question.leftSyllable)}
      </div>
      <div
        onClick={() => !hasAnswered && onAnswer('right')}
        className={`flex-1 font-bold text-8xl py-20 transition-all pointer-events-auto flex items-center justify-center gap-4 ${
          hasAnswered
            ? (selectedSide === 'right' ? 'opacity-100' : 'opacity-0')
            : 'cursor-pointer hover:bg-white hover:bg-opacity-10'
        }`}
      >
        {formatSyllable(question.rightSyllable)}
        <span className="text-8xl font-bold text-white">→</span>
      </div>
    </div>
  );
};

export default SyllableChoices;
