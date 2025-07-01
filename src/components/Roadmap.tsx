import React, { useState } from 'react'
import { Zap, Calendar, Package, Edit, FolderOpen, Users, Search, Receipt, CreditCard, Globe, Filter, Clock, CheckCircle, AlertCircle, TrendingUp, Star, Target } from 'lucide-react'

const Roadmap: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all')

  const roadmapItems = [
    { 
      id: 1,
      icon: Calendar, 
      title: 'Demandes de réservations', 
      description: 'Système de réservation intégré permettant aux clients de faire des demandes directement via le portail',
      features: ['Interface de demande client', 'Validation automatique', 'Notifications temps réel', 'Historique des demandes'],
      priority: 'high',
      eta: 'Q1 2025',
      progress: 25,
      status: 'in-progress',
      category: 'Client'
    },
    { 
      id: 2,
      icon: Package, 
      title: 'Gestion de stock LTA', 
      description: 'Suivi et gestion complète des stocks LTA avec alertes automatiques et prévisions',
      features: ['Suivi en temps réel', 'Alertes de stock bas', 'Prévisions automatiques', 'Rapports détaillés'],
      priority: 'high',
      eta: 'Q1 2025',
      progress: 40,
      status: 'in-progress',
      category: 'Opérations'
    },
    { 
      id: 3,
      icon: Edit, 
      title: 'Éditeur LTA', 
      description: 'Outil de création et modification des LTA avec interface intuitive et validation automatique',
      features: ['Éditeur visuel', 'Templates prédéfinis', 'Validation en temps réel', 'Historique des modifications'],
      priority: 'medium',
      eta: 'Q2 2025',
      progress: 10,
      status: 'planned',
      category: 'Outils'
    },
    { 
      id: 4,
      icon: FolderOpen, 
      title: 'Gestion des dossiers', 
      description: 'Organisation et suivi complet des dossiers avec workflow automatisé',
      features: ['Workflow personnalisable', 'Suivi des étapes', 'Assignation automatique', 'Archivage intelligent'],
      priority: 'high',
      eta: 'Q1 2025',
      progress: 60,
      status: 'in-progress',
      category: 'Opérations'
    },
    { 
      id: 5,
      icon: Users, 
      title: 'Gestion des utilisateurs', 
      description: 'Administration complète des comptes utilisateurs avec rôles et permissions granulaires',
      features: ['Rôles personnalisés', 'Permissions granulaires', 'Audit des actions', 'SSO intégré'],
      priority: 'medium',
      eta: 'Q2 2025',
      progress: 5,
      status: 'planned',
      category: 'Administration'
    },
    { 
      id: 6,
      icon: Search, 
      title: 'Recherche de vol améliorée', 
      description: 'Extension de la recherche : CDG, MRS, autres compagnies aériennes, vols avec escales',
      features: ['Multi-aéroports', 'Toutes compagnies', 'Vols avec escales', 'Comparateur de prix'],
      priority: 'medium',
      eta: 'Q2 2025',
      progress: 15,
      status: 'planned',
      category: 'Recherche'
    },
    { 
      id: 7,
      icon: Receipt, 
      title: 'Traitement factures hors CASS', 
      description: 'Gestion et traitement automatisé des factures d\'achat non-CASS',
      features: ['OCR automatique', 'Validation intelligente', 'Workflow d\'approbation', 'Intégration comptable'],
      priority: 'low',
      eta: 'Q3 2025',
      progress: 0,
      status: 'planned',
      category: 'Finance'
    },
    { 
      id: 8,
      icon: CreditCard, 
      title: 'Facturation', 
      description: 'Système de facturation intégré avec génération automatique et suivi des paiements',
      features: ['Génération automatique', 'Templates personnalisés', 'Suivi des paiements', 'Relances automatiques'],
      priority: 'medium',
      eta: 'Q2 2025',
      progress: 0,
      status: 'planned',
      category: 'Finance'
    },
    { 
      id: 9,
      icon: Globe, 
      title: 'Portail client', 
      description: 'Interface dédiée aux clients pour consulter leurs dossiers et faire des demandes',
      features: ['Dashboard client', 'Suivi en temps réel', 'Documents téléchargeables', 'Chat support'],
      priority: 'low',
      eta: 'Q3 2025',
      progress: 0,
      status: 'planned',
      category: 'Client'
    }
  ]

  const filteredItems = roadmapItems.filter(item => {
    const priorityMatch = selectedFilter === 'all' || item.priority === selectedFilter
    const quarterMatch = selectedQuarter === 'all' || item.eta.includes(selectedQuarter)
    return priorityMatch && quarterMatch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute priorité'
      case 'medium': return 'Priorité moyenne'
      case 'low': return 'Priorité basse'
      default: return 'Non définie'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'planned': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress': return 'En cours'
      case 'planned': return 'Planifié'
      case 'completed': return 'Terminé'
      default: return 'Non défini'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return Clock
      case 'planned': return Target
      case 'completed': return CheckCircle
      default: return AlertCircle
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Client': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      case 'Opérations': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'Outils': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
      case 'Administration': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'Recherche': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
      case 'Finance': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    }
  }

  const stats = {
    total: roadmapItems.length,
    inProgress: roadmapItems.filter(item => item.status === 'in-progress').length,
    planned: roadmapItems.filter(item => item.status === 'planned').length,
    highPriority: roadmapItems.filter(item => item.priority === 'high').length,
    avgProgress: Math.round(roadmapItems.reduce((acc, item) => acc + item.progress, 0) / roadmapItems.length)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Roadmap 2025</h2>
            <p className="text-gray-600 dark:text-gray-400">Feuille de route des prochaines fonctionnalités</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">En cours</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-red-600">{stats.highPriority}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Haute priorité</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-green-600">{stats.avgProgress}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Progression moy.</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">Filtres</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Priority Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Priorité :</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Toutes</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
            </div>

            {/* Quarter Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Trimestre :</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value as any)}
                className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous</option>
                <option value="Q1">Q1 2025</option>
                <option value="Q2">Q2 2025</option>
                <option value="Q3">Q3 2025</option>
                <option value="Q4">Q4 2025</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const StatusIcon = getStatusIcon(item.status)
          
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                          {getPriorityLabel(item.priority)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(item.status).split(' ')[0]}`} />
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Fonctionnalités clés :
                  </h4>
                  <ul className="space-y-1">
                    {item.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Progression
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.progress > 50 ? 'bg-green-500' :
                        item.progress > 25 ? 'bg-yellow-500' :
                        item.progress > 0 ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                {/* ETA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ETA : {item.eta}
                    </span>
                  </div>
                  
                  {item.status === 'in-progress' && (
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        En développement
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun élément trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aucune fonctionnalité ne correspond aux filtres sélectionnés.
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Star className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Développement agile et continu
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>
                • <strong>Méthodologie agile :</strong> Développement itératif avec livraisons fréquentes
              </p>
              <p>
                • <strong>Feedback utilisateur :</strong> Vos retours influencent directement les priorités
              </p>
              <p>
                • <strong>Dates indicatives :</strong> Les ETAs peuvent évoluer selon les besoins métier
              </p>
              <p>
                • <strong>Transparence totale :</strong> Suivi en temps réel de l'avancement des projets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Roadmap