# CLAUDE.md - Development Guide for AI Assistants

## Project Context

This is a collection of educational web applications for children, primarily focused on Russian language learning. The project is designed to be simple, self-contained, and easy to use without requiring build tools or complex setup.

## Architecture Principles

### 1. Self-Contained Apps
- Each app is a standalone HTML file with all code embedded
- No external dependencies beyond CDN-loaded libraries
- Can be opened directly in a browser without a server
- No build process or compilation required

### 2. Technology Stack
- **React 18**: UI framework (loaded via CDN)
- **Tailwind CSS**: Styling (loaded via CDN)
- **Babel Standalone**: JSX transformation in the browser
- **Web Speech API**: Text-to-speech for audio features

### 3. Target Audience
- Young children learning Russian
- Parents/teachers supervising learning
- Simple, intuitive interfaces with large, clear visuals

## Current Apps

### Syllables App (`syllables-app/syllables-app.html`)

**Purpose**: Teach Russian syllables by combining consonants and vowels

**Key Components**:
- `RussianSyllablesApp`: Main React component
- `consonants`: Array of Russian consonant letters (20 letters)
- `vowels`: Array of Russian vowel letters (10 letters)
- `isValidSyllable()`: Validates syllables according to Russian orthography rules

**Russian Orthography Rules Implemented**:
1. ЖИ, ШИ (never ЖЫ, ШЫ) - after Ж, Ш use И not Ы
2. ЧА, ЩА (never ЧЯ, ЩЯ) - after Ч, Щ use А not Я
3. ЧУ, ЩУ (never ЧЮ, ЩЮ) - after Ч, Щ use У not Ю
4. After Ж, Ш, Ч, Щ, Ц never use Э

**Features**:
- Two modes: random syllables or filtered by consonant
- Audio playback using Web Speech API (Russian language)
- Multiple background colors for different lighting conditions
- Uppercase/lowercase toggle
- Counter to track progress
- Keyboard shortcuts (Space = next, Escape = menu)

**State Management**:
- `mode`: 'random' or 'selected'
- `selectedConsonant`: Current consonant filter
- `currentSyllable`: Currently displayed syllable
- `count`: Number of syllables shown
- `soundEnabled`: Audio on/off
- `bgIndex`: Current background theme
- `isUpperCase`: Letter case toggle

**Audio Behavior**:
- First syllable shows without audio
- Subsequent syllables: speaks current syllable, then shows next
- Uses `speechSynthesis.cancel()` to prevent overlapping speech
- Russian language (ru-RU), slower rate (0.7), higher pitch (1.2)

## Development Guidelines

### Adding New Apps

1. **Create a new directory** under `Kids/`:
   ```
   Kids/
   ├── new-app-name/
   │   └── new-app-name.html
   ```

2. **Follow the self-contained pattern**:
   - Single HTML file with embedded CSS and JavaScript
   - Use CDN links for dependencies
   - Include React, Tailwind CSS via CDN
   - Use Babel Standalone for JSX

3. **Standard template structure**:
   ```html
   <!DOCTYPE html>
   <html lang="ru">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>App Title</title>
       <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
       <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
       <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
       <script src="https://cdn.tailwindcss.com"></script>
   </head>
   <body>
       <div id="root"></div>
       <script type="text/babel">
           // React code here
       </script>
   </body>
   </html>
   ```

4. **Design considerations**:
   - Large, clear visuals suitable for children
   - Simple, intuitive interactions (click, spacebar)
   - Colorful, engaging UI
   - Responsive design (mobile and desktop)
   - Keyboard shortcuts for ease of use
   - Audio support where appropriate

### Code Style

- Use functional React components with hooks
- Keep state management simple (useState, useEffect)
- Inline styles or Tailwind classes (no separate CSS files)
- Clear, descriptive variable and function names
- Comments for complex logic or domain-specific rules

### Testing

- Test in multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices (responsive design)
- Test keyboard navigation
- Test audio features (if applicable)
- Verify that app works without internet after initial load (cached CDN resources)

## Future Considerations

As more apps are added:
- Consider shared components or utilities
- May need a simple index page to list all apps
- Could add common UI patterns (menu, settings)
- Might want to localize for other languages
- Consider offline functionality (Service Workers)

## Russian Language Notes

When working with Russian language features:
- Use lang="ru" in HTML tag
- Use Cyrillic alphabet properly
- Respect Russian orthography and grammar rules
- For speech synthesis, use 'ru-RU' language code
- Be aware of hard/soft consonants, vowel reduction, etc.

## Git Workflow

- Main branch: `master`
- Commit messages should be descriptive
- Each app addition should be a separate commit
- Update README.md when adding new apps
