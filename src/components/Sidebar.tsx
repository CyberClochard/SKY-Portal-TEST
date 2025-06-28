import React from 'react'
import { Database, BarChart3, Settings, Home, FileText, Users, ChevronLeft, Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'data', icon: Database, label: 'Opérations' },
    { id: 'analytics', icon: BarChart3, label: 'Analyses' },
    { id: 'reports', icon: FileText, label: 'Rapports' },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ]

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 z-10 shadow-sm"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <Menu className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Header */}
      <div className={`p-6 border-b border-gray-200 dark:border-gray-800 ${isCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">SkyLogistics</h1>
                <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">Dashboard</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Theme Toggle */}
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Thème</span>
            <ThemeToggle />
          </div>
        )}
        
        {/* Collapsed Theme Toggle */}
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <ThemeToggle />
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-800`}>
        <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg ${isCollapsed ? 'p-2' : 'p-3'} transition-colors duration-300`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-gray-900 dark:text-white text-sm font-medium whitespace-nowrap">Admin</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">En ligne</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar