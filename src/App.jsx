import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import SyllablesApp from './apps/syllables/SyllablesApp'

const AppsIndex = () => {
  const apps = [
    {
      id: 'syllables',
      title: 'Russian Syllables',
      titleRu: 'Русские слоги',
      description: 'Learn Russian syllables by combining consonants and vowels',
      descriptionRu: 'Изучайте русские слоги, комбинируя согласные и гласные',
      path: '/syllables',
      icon: '📚',
      color: 'from-blue-400 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Kids Learning Apps
          </h1>
          <p className="text-center text-gray-600 mt-2 text-lg">
            Обучающие приложения для детей
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(app => (
            <Link
              key={app.id}
              to={app.path}
              className="block group"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full">
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${app.color} p-6 text-center`}>
                  <div className="text-6xl mb-3">
                    {app.icon}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {app.titleRu}
                  </h2>
                  <h3 className="text-lg text-gray-600 mb-3">
                    {app.title}
                  </h3>
                  <p className="text-gray-700 mb-2">
                    {app.descriptionRu}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {app.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3 rounded-lg font-semibold group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                    Open App / Открыть →
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
              About / О приложении
            </h3>
            <p className="text-gray-700 mb-2">
              This is a collection of educational web applications for children, primarily focused on Russian language learning.
            </p>
            <p className="text-gray-700">
              Это коллекция обучающих веб-приложений для детей, в основном ориентированных на изучение русского языка.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-6 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>Made with ❤️ for kids learning</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppsIndex />} />
        <Route path="/syllables" element={<SyllablesApp />} />
      </Routes>
    </Router>
  )
}

export default App
