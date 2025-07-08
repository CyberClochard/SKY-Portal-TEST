import React, { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import DataTable from './components/DataTable'
import FlightSearch from './components/FlightSearch'
import CassFileProcessor from './components/CassFileProcessor'
import AWBValidation from './components/AWBValidation'
import BookingConfirmationTool from './components/BookingConfirmationTool'
import Roadmap from './components/Roadmap'
import Settings from './components/Settings'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
 
  // Get n8n base URL from localStorage for workflows
  const n8nBaseUrl = localStorage.getItem('n8n_base_url') || ''

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'data':
        return <DataTable />
      case 'flights':
        return <FlightSearch n8nBaseUrl={n8nBaseUrl} />
      case 'cass':
        return <CassFileProcessor n8nBaseUrl={n8nBaseUrl} />
      case 'awb-validation':
        return <AWBValidation />
      case 'booking-confirmation':
        return <BookingConfirmationTool />
      case 'roadmap':
        return <Roadmap />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex transition-colors duration-300">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <main className="flex-1 overflow-auto">
          {/* Mobile padding to account for floating menu button */}
          <div className="p-4 md:p-8 pt-20 md:pt-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
