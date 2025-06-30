import React, { useState, useEffect } from 'react'
import { Palette, Monitor, Sun, Moon, Sparkles, Leaf, Zap, Heart, Crown, Waves, Mountain, Coffee } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface Theme {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  preview: {
    gradient: string
    shadow: string
  }
}

const Settings: React.FC = () => {
  const { theme, toggleTheme, setCustomTheme, customTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(customTheme || 'default')

  const themes: Theme[] = [
    {
      id: 'default',
      name: 'Classique',
      description: 'Thème par défaut avec mode sombre/clair',
      icon: Monitor,
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827'
      },
      preview: {
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-200'
      }
    },
    {
      id: 'ocean',
      name: 'Océan',
      description: 'Inspiré par les profondeurs marines',
      icon: Waves,
      colors: {
        primary: '#0EA5E9',
        secondary: '#0F766E',
        accent: '#06B6D4',
        background: '#F0F9FF',
        surface: '#FFFFFF',
        text: '#0C4A6E'
      },
      preview: {
        gradient: 'from-cyan-500 to-blue-500',
        shadow: 'shadow-cyan-200'
      }
    },
    {
      id: 'forest',
      name: 'Forêt',
      description: 'Harmonie naturelle et apaisante',
      icon: Leaf,
      colors: {
        primary: '#059669',
        secondary: '#065F46',
        accent: '#10B981',
        background: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#064E3B'
      },
      preview: {
        gradient: 'from-green-500 to-emerald-600',
        shadow: 'shadow-green-200'
      }
    },
    {
      id: 'sunset',
      name: 'Coucher de soleil',
      description: 'Chaleur et énergie des fins de journée',
      icon: Sun,
      colors: {
        primary: '#F59E0B',
        secondary: '#DC2626',
        accent: '#EF4444',
        background: '#FFFBEB',
        surface: '#FFFFFF',
        text: '#92400E'
      },
      preview: {
        gradient: 'from-orange-500 to-red-500',
        shadow: 'shadow-orange-200'
      }
    },
    {
      id: 'purple',
      name: 'Mystique',
      description: 'Élégance et sophistication',
      icon: Sparkles,
      colors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#A855F7',
        background: '#FAF5FF',
        surface: '#FFFFFF',
        text: '#581C87'
      },
      preview: {
        gradient: 'from-purple-500 to-violet-600',
        shadow: 'shadow-purple-200'
      }
    },
    {
      id: 'royal',
      name: 'Royal',
      description: 'Luxe et prestige',
      icon: Crown,
      colors: {
        primary: '#1E40AF',
        secondary: '#7C2D12',
        accent: '#D97706',
        background: '#FEF3C7',
        surface: '#FFFFFF',
        text: '#1E3A8A'
      },
      preview: {
        gradient: 'from-blue-700 to-amber-500',
        shadow: 'shadow-amber-200'
      }
    },
    {
      id: 'mountain',
      name: 'Montagne',
      description: 'Force et stabilité',
      icon: Mountain,
      colors: {
        primary: '#374151',
        secondary: '#6B7280',
        accent: '#9CA3AF',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827'
      },
      preview: {
        gradient: 'from-gray-600 to-slate-700',
        shadow: 'shadow-gray-200'
      }
    },
    {
      id: 'coffee',
      name: 'Café',
      description: 'Chaleur et confort',
      icon: Coffee,
      colors: {
        primary: '#92400E',
        secondary: '#78350F',
        accent: '#D97706',
        background: '#FEF3C7',
        surface: '#FFFFFF',
        text: '#451A03'
      },
      preview: {
        gradient: 'from-amber-700 to-orange-600',
        shadow: 'shadow-amber-200'
      }
    },
    {
      id: 'electric',
      name: 'Électrique',
      description: 'Énergie et modernité',
      icon: Zap,
      colors: {
        primary: '#06B6D4',
        secondary: '#0891B2',
        accent: '#22D3EE',
        background: '#ECFEFF',
        surface: '#FFFFFF',
        text: '#164E63'
      },
      preview: {
        gradient: 'from-cyan-400 to-cyan-600',
        shadow: 'shadow-cyan-200'
      }
    },
    {
      id: 'romantic',
      name: 'Romantique',
      description: 'Douceur et élégance',
      icon: Heart,
      colors: {
        primary: '#EC4899',
        secondary: '#BE185D',
        accent: '#F472B6',
        background: '#FDF2F8',
        surface: '#FFFFFF',
        text: '#831843'
      },
      preview: {
        gradient: 'from-pink-500 to-rose-500',
        shadow: 'shadow-pink-200'
      }
    }
  ]

  const applyTheme = (themeId: string) => {
    setSelectedTheme(themeId)
    setCustomTheme(themeId)
    
    if (themeId === 'default') {
      // Retour au thème par défaut
      document.documentElement.style.removeProperty('--color-primary')
      document.documentElement.style.removeProperty('--color-secondary')
      document.documentElement.style.removeProperty('--color-accent')
      return
    }

    const selectedThemeData = themes.find(t => t.id === themeId)
    if (selectedThemeData) {
      // Appliquer les variables CSS personnalisées
      document.documentElement.style.setProperty('--color-primary', selectedThemeData.colors.primary)
      document.documentElement.style.setProperty('--color-secondary', selectedThemeData.colors.secondary)
      document.documentElement.style.setProperty('--color-accent', selectedThemeData.colors.accent)
    }
  }

  useEffect(() => {
    // Appliquer le thème sauvegardé au chargement
    if (customTheme && customTheme !== 'default') {
      applyTheme(customTheme)
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h2>
            <p className="text-gray-600 dark:text-gray-400">Personnalisez votre expérience SkyLogistics</p>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Thèmes visuels</h3>
            <p className="text-gray-600 dark:text-gray-400">Choisissez un thème qui correspond à votre style</p>
          </div>
        </div>

        {/* Current Theme Toggle */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-400" />
                )}
                <span className="text-gray-900 dark:text-white font-medium">
                  Mode {theme === 'light' ? 'clair' : 'sombre'}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                Thème: {themes.find(t => t.id === selectedTheme)?.name || 'Classique'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span>Basculer</span>
            </button>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            const isSelected = selectedTheme === themeOption.id
            
            return (
              <button
                key={themeOption.id}
                onClick={() => applyTheme(themeOption.id)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                {/* Preview Gradient */}
                <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${themeOption.preview.gradient} mb-3 ${themeOption.preview.shadow} group-hover:shadow-lg transition-shadow duration-300`}>
                  <div className="w-full h-full rounded-lg bg-white/20 dark:bg-black/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                </div>

                {/* Theme Info */}
                <div className="text-left">
                  <h4 className={`font-semibold mb-1 ${
                    isSelected 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {themeOption.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {themeOption.description}
                  </p>
                </div>

                {/* Color Palette Preview */}
                <div className="flex space-x-1 mt-3">
                  <div 
                    className="w-3 h-3 rounded-full border border-white/50"
                    style={{ backgroundColor: themeOption.colors.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-white/50"
                    style={{ backgroundColor: themeOption.colors.secondary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-white/50"
                    style={{ backgroundColor: themeOption.colors.accent }}
                  />
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Theme Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                Thèmes optimisés pour la performance
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Les thèmes utilisent des variables CSS natives pour un changement instantané sans impact sur les performances. 
                Votre choix est automatiquement sauvegardé et synchronisé avec le mode sombre/clair.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Other Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres généraux</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Notifications</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Recevoir les notifications système</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Sauvegarde automatique</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Sauvegarder les données automatiquement</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Animations
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Toutes les animations</option>
                <option value="reduced">Animations réduites</option>
                <option value="none">Aucune animation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qualité des graphiques
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="high">Haute qualité</option>
                <option value="medium">Qualité moyenne</option>
                <option value="low">Qualité réduite</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">À propos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Version</p>
            <p className="text-gray-900 dark:text-white font-medium">SkyLogistics v2.1.0</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Dernière mise à jour</p>
            <p className="text-gray-900 dark:text-white font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Environnement</p>
            <p className="text-gray-900 dark:text-white font-medium">Production</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings