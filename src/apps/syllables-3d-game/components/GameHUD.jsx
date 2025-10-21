/**
 * GameHUD Component
 *
 * Heads-up display showing game stats and controls
 */
const GameHUD = ({ speed, score, correctAnswers, totalQuestions, onBack }) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
      <div className="space-y-2">
        <div className="bg-black bg-opacity-70 text-white rounded-xl px-6 py-3">
          <p className="text-2xl font-bold">Скорость: {speed}</p>
        </div>
        <div className="bg-black bg-opacity-70 text-white rounded-xl px-6 py-3">
          <p className="text-2xl font-bold">Очки: {score}</p>
        </div>
        <div className="bg-black bg-opacity-70 text-white rounded-xl px-6 py-3">
          <p className="text-xl font-bold">
            Правильных: {correctAnswers}/{totalQuestions}
          </p>
        </div>
      </div>
      <div className="pointer-events-auto">
        <button
          onClick={onBack}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-3 text-xl font-bold transition"
        >
          ☰ Меню
        </button>
      </div>
    </div>
  );
};

export default GameHUD;
