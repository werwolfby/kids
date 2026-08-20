import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import SyllablesApp from './apps/syllables/SyllablesApp'
import PopularWordsApp from './apps/popular-words/PopularWordsApp'
import SentencesApp from './apps/sentences/SentencesApp'
import { LanguageProvider, useLanguage } from './shared/i18n/LanguageContext'
import LanguageSwitcher from './shared/i18n/LanguageSwitcher'

const AppsIndex = () => {
  const { t } = useLanguage();

  const apps = [
    {
      id: 'syllables',
      ...t.apps.syllables,
      path: '/syllables',
      icon: '📚',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'popular-words',
      ...t.apps.popularWords,
      path: '/popular-words',
      icon: '📖',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: 'sentences',
      ...t.apps.sentences,
      path: '/sentences',
      icon: '📝',
      color: 'from-amber-400 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t.home.brand}
          </h1>
          <p className="text-center text-gray-600 mt-2 text-lg">
            {t.home.subtitle}
          </p>
        </div>
      </header>

      {/* Language picker — от него зависит весь контент приложений */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(app => (
            <Link
              key={app.id}
              to={app.path}
              className="block group"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full flex flex-col">
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${app.color} p-6 text-center`}>
                  <div className="text-6xl mb-3">
                    {app.icon}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {app.title}
                  </h2>
                  <p className="text-gray-700">
                    {app.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3 rounded-lg font-semibold group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                    {t.home.open} →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {t.home.aboutTitle}
            </h3>
            <p className="text-gray-700">
              {t.home.about}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-6 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>{t.home.footer}</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppsIndex />} />
          <Route path="/syllables" element={<SyllablesApp />} />
          <Route path="/popular-words" element={<PopularWordsApp />} />
          <Route path="/sentences" element={<SentencesApp />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
