/**
 * Shared Icon Components
 *
 * SVG icon components used across the application
 */

export const ShuffleIcon = ({ width = 48, height = 48, className = "" }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);

export const FilterIcon = ({ width = 32, height = 32, className = "" }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const CarIcon = ({ className = "" }) => (
  <span className={className}>🏎️</span>
);

export const BookIcon = ({ className = "" }) => (
  <span className={className}>📚</span>
);

export const SoundOnIcon = ({ className = "" }) => (
  <span className={className}>🔊</span>
);

export const SoundOffIcon = ({ className = "" }) => (
  <span className={className}>🔇</span>
);

export const PaletteIcon = ({ className = "" }) => (
  <span className={className}>🎨</span>
);

export const MenuIcon = ({ className = "" }) => (
  <span className={className}>☰</span>
);
