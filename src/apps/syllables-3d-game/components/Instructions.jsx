/**
 * Instructions Component
 *
 * Shows game instructions that auto-hide after a few seconds
 */
const Instructions = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
      <div className="bg-black bg-opacity-60 text-white rounded-2xl px-8 py-4">
        <p className="text-2xl font-bold">
          ← или → для ответа | ↑ повторить
        </p>
      </div>
    </div>
  );
};

export default Instructions;
