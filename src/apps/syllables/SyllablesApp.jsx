import { useState, useEffect } from 'react';
import SyllablesMenu from './SyllablesMenu';
import SyllablesDisplay from './SyllablesDisplay';
import Game3D from '../syllables-3d-game/Game3D';
import { MODE, SYLLABLE_ORDER, BACKGROUNDS } from './constants';
import { consonants, vowels } from '../../shared/utils/russianOrthography';
import {
  generateRandomSyllable,
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
  // Consonants/vowels the child is practising. Empty = all of them.
  const [selectedConsonants, setSelectedConsonants] = useState([]);
  const [selectedVowels, setSelectedVowels] = useState([]);
  // Include syllables ending in the soft sign (СОГ + Ь), CV order only.
  const [softSign, setSoftSign] = useState(false);
  const [currentSyllable, setCurrentSyllable] = useState('');
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [syllableOrder, setSyllableOrder] = useState(SYLLABLE_ORDER.CV);
  // Show the чистоговорка / sample word under the card (can distract some kids)
  const [showHints, setShowHints] = useState(true);

  // Toggles a letter in/out of a selection set
  const toggleInSet = (setter) => (letter) => {
    setter(prev =>
      prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
    );
  };
  const toggleConsonant = toggleInSet(setSelectedConsonants);
  const toggleVowel = toggleInSet(setSelectedVowels);

  // The letter/soft-sign constraints passed to the syllable generator
  const syllableOptions = {
    consonants: selectedConsonants,
    vowels: selectedVowels,
    softSign
  };

  /**
   * Starts a mode, restricted to the selected letters (or all if none selected)
   */
  const startMode = (newMode) => {
    setMode(newMode);
    setCount(0);
    setShowMenu(false);

    // Generate first syllable (shown WITHOUT audio)
    setCurrentSyllable(generateRandomSyllable(syllableOrder, syllableOptions));
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
        syllableOptions
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
  }, [showMenu, mode, selectedConsonants, selectedVowels, softSign, soundEnabled, currentSyllable, syllableOrder]);

  // Handle 3D game mode
  if (mode === MODE.GAME_3D && !showMenu) {
    return (
      <Game3D
        onBack={() => setShowMenu(true)}
        consonants={selectedConsonants.length > 0 ? selectedConsonants : consonants}
        vowels={selectedVowels.length > 0 ? selectedVowels : vowels}
        softSign={softSign}
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
        selectedConsonants={selectedConsonants}
        onToggleConsonant={toggleConsonant}
        onClearConsonants={() => setSelectedConsonants([])}
        onSelectAllConsonants={() => setSelectedConsonants([...consonants])}
        selectedVowels={selectedVowels}
        onToggleVowel={toggleVowel}
        onClearVowels={() => setSelectedVowels([])}
        onSelectAllVowels={() => setSelectedVowels([...vowels])}
        softSign={softSign}
        onToggleSoftSign={() => setSoftSign(prev => !prev)}
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
      selectedConsonants={selectedConsonants}
      selectedVowels={selectedVowels}
      softSign={softSign}
      showHints={showHints}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
      onChangeBg={() => setBgIndex((bgIndex + 1) % BACKGROUNDS.length)}
      onToggleCase={() => setIsUpperCase(!isUpperCase)}
      onToggleHints={() => setShowHints(!showHints)}
      onShowMenu={() => setShowMenu(true)}
      onNextSyllable={nextSyllable}
    />
  );
};

export default SyllablesApp;
