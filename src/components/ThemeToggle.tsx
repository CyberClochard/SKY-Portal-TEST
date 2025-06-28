import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {/* Toggle background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-purple-500 dark:to-purple-700 opacity-0 dark:opacity-100 transition-opacity duration-300" />
      
      {/* Toggle circle */}
      <div className={`absolute w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
        theme === 'dark' ? 'translate-x-3' : '-translate-x-3'
      }`}>
        {theme === 'light' ? (
          <Sun className="w-3 h-3 text-yellow-500" />
        ) : (
          <Moon className="w-3 h-3 text-purple-600" />
        )}
      </div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1">
        <Sun className={`w-3 h-3 transition-opacity duration-300 ${
          theme === 'light' ? 'text-gray-400 opacity-50' : 'text-yellow-300 opacity-100'
        }`} />
        <Moon className={`w-3 h-3 transition-opacity duration-300 ${
          theme === 'dark' ? 'text-gray-400 opacity-50' : 'text-purple-400 opacity-100'
        }`} />
      </div>
    </button>
  )
}

export default ThemeToggle