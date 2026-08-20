import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, getLanguage, isSupportedLanguage } from './languages';
import { getUI, fill } from './ui';

const STORAGE_KEY = 'kids-apps-language';

/**
 * Язык, выбранный в прошлый раз. Русский — язык по умолчанию.
 */
const readStoredLanguage = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage может быть недоступен (приватный режим) — не страшно
  }
  return DEFAULT_LANGUAGE;
};

const LanguageContext = createContext(null);

/**
 * LanguageProvider
 *
 * Хранит выбранный язык, сохраняет его в localStorage и отдаёт вниз по дереву
 * сам код языка, надписи интерфейса (t) и метаданные языка.
 */
export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(readStoredLanguage);

  const setLang = (code) => {
    if (!isSupportedLanguage(code)) return;
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Не сохранилось — язык всё равно работает до перезагрузки
    }
  };

  // Держим <html lang> в актуальном состоянии: от него зависит,
  // как экранный диктор и браузер читают текст.
  useEffect(() => {
    document.documentElement.lang = getLanguage(lang).htmlLang;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    language: getLanguage(lang),
    t: getUI(lang),
    fill
  }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Доступ к текущему языку и надписям: const { lang, t } = useLanguage().
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage должен вызываться внутри <LanguageProvider>');
  }
  return context;
};
