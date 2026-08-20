import { LANGUAGES } from './languages';
import { useLanguage } from './LanguageContext';

/**
 * LanguageSwitcher
 *
 * Выбор языка обучения: русский (по умолчанию), белорусский, украинский.
 * От языка зависит всё: буквы и правила слогов, слова, предложения,
 * надписи интерфейса и голос озвучки.
 */
const LanguageSwitcher = () => {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-gray-600 text-lg font-semibold">
        {t.home.languageLabel}
      </p>
      <div
        className="flex flex-wrap justify-center gap-3"
        role="group"
        aria-label={t.home.languageLabel}
      >
        {LANGUAGES.map(language => {
          const isActive = language.code === lang;
          return (
            <button
              key={language.code}
              onClick={() => setLang(language.code)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg ring-4 ring-yellow-300'
                  : 'bg-white text-gray-600 shadow hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{language.flag}</span>
              {language.nativeName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
