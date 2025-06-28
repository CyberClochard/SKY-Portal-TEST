import React, { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import DataTable from './components/DataTable'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'data':
        return <DataTable />
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analyses</h2>
            <p className="text-gray-600 dark:text-gray-400">Section d'analyses en cours de développement</p>
          </div>
        )
      case 'reports':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rapports</h2>
            <p className="text-gray-600 dark:text-gray-400">Section de rapports en cours de développement</p>
          </div>
        )
      case 'users':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Utilisateurs</h2>
            <p className="text-gray-600 dark:text-gray-400">Gestion des utilisateurs en cours de développement</p>
          </div>
        )
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Paramètres</h2>
            <p className="text-gray-600 dark:text-gray-400">Section de paramètres en cours de développement</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <ThemeProvider>
      <div className="h-screen bg-gray-100 dark:bg-gray-950 flex transition-colors duration-300">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App