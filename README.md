# Kids Learning Apps

A collection of educational web applications for children, focusing on Russian language learning.

## Overview

This repository contains multiple standalone web applications designed to help kids learn fundamental concepts in an interactive and engaging way. Each app is self-contained and can be opened directly in a web browser.

## Current Applications

### Syllables App (`syllables-app/`)

An interactive application for teaching Russian syllables to children.

**Features:**
- **Random mode**: Practice with randomly generated syllables
- **Letter mode**: Focus on syllables starting with a specific consonant
- **Audio support**: Hear syllables pronounced using text-to-speech
- **Customizable display**: Toggle between uppercase/lowercase, change backgrounds
- **Russian spelling rules**: Only shows valid syllable combinations according to Russian orthography rules

**How to use:**
1. Open `syllables-app/syllables-app.html` in your web browser
2. Choose random mode or select a specific consonant letter
3. Click anywhere on the screen or press SPACE to see the next syllable
4. Use the control buttons in the top-right corner to:
   - Toggle sound on/off (🔊/🔇)
   - Switch between uppercase and lowercase (АБ/аб)
   - Change background color (🎨)
   - Return to menu (☰)
5. Press ESC to return to the main menu

## Future Plans

This repository will grow to include additional educational applications for:
- Math exercises
- Memory games
- Reading practice
- And more...

## Technical Details

All applications are built as standalone HTML files using:
- React 18 (via CDN)
- Tailwind CSS (via CDN)
- No build process required
- No dependencies to install

Simply open any `.html` file in a modern web browser to start using the app.

## Project Structure

```
Kids/
├── syllables-app/
│   └── syllables-app.html
├── README.md
└── CLAUDE.md
```

Each future app will have its own directory with self-contained files.

## License

This is an educational project for personal use.
