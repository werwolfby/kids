import { useState, useEffect } from 'react';
import SyllablesMenu from './SyllablesMenu';
import SyllablesDisplay from './SyllablesDisplay';
import Game3D from '../syllables-3d-game/Game3D';
import { MODE, SYLLABLE_ORDER, BACKGROUNDS } from './constants';
import { consonants, vowels } from '../../shared/utils/russianOrthography';
import {
  generateRandomSyllable,
  generateSyllableWithConsonant,
  generateDifferentSyllable
} from '../../shared/utils/syllables';
import { speakSyllable } from '../../shared/utils/speech';

/**
 * SyllablesApp Component
 *
 * Main application component that manages:
 * - Syllable generation and display
 * - Mode switching (random, selected consonant, 3D game)
 * - Sound, background, and case settings
 * - Keyboard navigation
 */
const SyllablesApp = () => {
  const [mode, setMode] = useState(MODE.RANDOM);
  const [selectedConsonant, setSelectedConsonant] = useState('');
  const [currentSyllable, setCurrentSyllable] = useState('');
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [syllableOrder, setSyllableOrder] = useState(SYLLABLE_ORDER.CV);

  /**
   * Starts a mode with optional consonant selection
   */
  const startMode = (newMode, consonant = '') => {
    setMode(newMode);
    setSelectedConsonant(consonant);
    setCount(0);
    setShowMenu(false);

    // Generate first syllable
    const firstSyllable = newMode === MODE.RANDOM
      ? generateRandomSyllable(syllableOrder)
      : generateSyllableWithConsonant(consonant, syllableOrder);

    setCurrentSyllable(firstSyllable);
    // First syllable shows WITHOUT audio
  };

  /**
   * Shows the next syllable with animation and optional sound
   */
  const showNextSyllable = () => {
    setAnimate(true);
    setTimeout(() => {
      const newSyllable = generateDifferentSyllable(
        currentSyllable,
        syllableOrder,
        mode === MODE.SELECTED ? selectedConsonant : null
      );

      setCurrentSyllable(newSyllable);
      setCount(prev => prev + 1);
      setAnimate(false);
    }, 150);
  };

  /**
   * Advances to next syllable
   * - Speaks current syllable first (if sound enabled)
   * - Then shows next syllable
   */
  const nextSyllable = () => {
    if (soundEnabled && currentSyllable) {
      // Speak current syllable, then show next
      speakSyllable(currentSyllable, () => {
        showNextSyllable();
      });
    } else {
      // Just show next syllable immediately
      showNextSyllable();
    }
  };

  /**
   * Keyboard event handler
   */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !showMenu) {
        e.preventDefault();
        nextSyllable();
      }
      if (e.code === 'Escape' && !showMenu) {
        setShowMenu(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMenu, mode, selectedConsonant, soundEnabled, currentSyllable, syllableOrder]);

  // Handle 3D game mode
  if (mode === MODE.GAME_3D && !showMenu) {
    return (
      <Game3D
        onBack={() => setShowMenu(true)}
        consonants={consonants}
        vowels={vowels}
        syllableOrder={syllableOrder}
        isUpperCase={isUpperCase}
      />
    );
  }

  // Show menu screen
  if (showMenu) {
    return (
      <SyllablesMenu
        syllableOrder={syllableOrder}
        onSyllableOrderChange={setSyllableOrder}
        onStartMode={startMode}
      />
    );
  }

  // Show syllable display screen
  return (
    <SyllablesDisplay
      currentSyllable={currentSyllable}
      syllableOrder={syllableOrder}
      count={count}
      animate={animate}
      soundEnabled={soundEnabled}
      bgIndex={bgIndex}
      isUpperCase={isUpperCase}
      selectedConsonant={mode === MODE.SELECTED ? selectedConsonant : null}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
      onChangeBg={() => setBgIndex((bgIndex + 1) % BACKGROUNDS.length)}
      onToggleCase={() => setIsUpperCase(!isUpperCase)}
      onShowMenu={() => setShowMenu(true)}
      onNextSyllable={nextSyllable}
    />
  );
};

export default SyllablesApp;
