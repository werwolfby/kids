/**
 * GameOver Component
 *
 * Game over screen with final stats
 */
const GameOver = ({ score, correctAnswers, totalQuestions, onBack }) => {
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        <h1 className="text-6xl font-bold text-center mb-8 text-red-600">
          GAME OVER!
        </h1>
        <div className="space-y-4 mb-8">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
            <p className="text-3xl font-bold text-gray-800">
              Очки: <span className="text-blue-600">{score}</span>
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6">
            <p className="text-3xl font-bold text-gray-800">
              Правильных ответов:{' '}
              <span className="text-green-600">
                {correctAnswers}
              </span> из {totalQuestions}
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6">
            <p className="text-3xl font-bold text-gray-800">
              Точность: <span className="text-orange-600">{accuracy}%</span>
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl p-6 text-3xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
        >
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default GameOver;
