import React, { useState } from 'react'
import { Zap, Calendar, Package, Edit, FolderOpen, Users, Search, Receipt, CreditCard, Globe, Filter, Clock, CheckCircle, AlertCircle, TrendingUp, Star, Target, ChevronRight, ExternalLink, Heart, Eye, MessageSquare, GitBranch, Bookmark, BookmarkCheck } from 'lucide-react'

const Roadmap: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all')
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

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
      category: 'Client',
      team: 'Frontend Team',
      estimatedHours: 120,
      dependencies: ['Gestion des utilisateurs'],
      techStack: ['React', 'TypeScript', 'Supabase'],
      businessValue: 'Améliore l\'expérience client et réduit la charge de travail manuelle',
      risks: ['Intégration complexe avec les systèmes existants'],
      milestones: [
        { name: 'Design UI/UX', completed: true },
        { name: 'API Backend', completed: false },
        { name: 'Tests utilisateur', completed: false }
      ]
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
      category: 'Opérations',
      team: 'Backend Team',
      estimatedHours: 80,
      dependencies: [],
      techStack: ['Node.js', 'PostgreSQL', 'n8n'],
      businessValue: 'Optimise la gestion des stocks et réduit les ruptures',
      risks: ['Migration des données existantes'],
      milestones: [
        { name: 'Base de données', completed: true },
        { name: 'API CRUD', completed: true },
        { name: 'Interface utilisateur', completed: false }
      ]
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
      category: 'Outils',
      team: 'Full Stack Team',
      estimatedHours: 160,
      dependencies: ['Gestion de stock LTA'],
      techStack: ['React', 'Monaco Editor', 'PDF.js'],
      businessValue: 'Simplifie la création de LTA et réduit les erreurs',
      risks: ['Complexité de l\'éditeur visuel'],
      milestones: [
        { name: 'Recherche technique', completed: false },
        { name: 'Prototype', completed: false },
        { name: 'Développement', completed: false }
      ]
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
      category: 'Opérations',
      team: 'Backend Team',
      estimatedHours: 200,
      dependencies: ['Gestion des utilisateurs'],
      techStack: ['Node.js', 'Workflow Engine', 'PostgreSQL'],
      businessValue: 'Améliore l\'efficacité opérationnelle et la traçabilité',
      risks: ['Complexité des workflows métier'],
      milestones: [
        { name: 'Analyse des besoins', completed: true },
        { name: 'Architecture système', completed: true },
        { name: 'Développement core', completed: false }
      ]
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
      category: 'Administration',
      team: 'Security Team',
      estimatedHours: 140,
      dependencies: [],
      techStack: ['Auth0', 'RBAC', 'Audit Logs'],
      businessValue: 'Sécurise l\'accès et améliore la gouvernance',
      risks: ['Migration des utilisateurs existants'],
      milestones: [
        { name: 'Spécifications sécurité', completed: false },
        { name: 'Intégration Auth0', completed: false },
        { name: 'Tests sécurité', completed: false }
      ]
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
      category: 'Recherche',
      team: 'API Team',
      estimatedHours: 100,
      dependencies: [],
      techStack: ['Amadeus API', 'React', 'Cache Redis'],
      businessValue: 'Élargit les options de recherche et améliore l\'expérience',
      risks: ['Coûts API externes'],
      milestones: [
        { name: 'Intégration Amadeus', completed: false },
        { name: 'Interface multi-aéroports', completed: false },
        { name: 'Optimisation performances', completed: false }
      ]
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
      category: 'Finance',
      team: 'AI Team',
      estimatedHours: 180,
      dependencies: ['Gestion des utilisateurs'],
      techStack: ['OCR Engine', 'ML Models', 'Workflow'],
      businessValue: 'Automatise le traitement des factures et réduit les erreurs',
      risks: ['Précision de l\'OCR', 'Complexité des formats'],
      milestones: [
        { name: 'Recherche OCR', completed: false },
        { name: 'Prototype IA', completed: false },
        { name: 'Intégration workflow', completed: false }
      ]
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
      category: 'Finance',
      team: 'Finance Team',
      estimatedHours: 220,
      dependencies: ['Gestion des dossiers'],
      techStack: ['PDF Generation', 'Payment Gateway', 'Email Service'],
      businessValue: 'Améliore le cash flow et réduit les délais de paiement',
      risks: ['Intégration systèmes comptables'],
      milestones: [
        { name: 'Analyse besoins comptables', completed: false },
        { name: 'Intégration paiements', completed: false },
        { name: 'Templates factures', completed: false }
      ]
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
      category: 'Client',
      team: 'Frontend Team',
      estimatedHours: 300,
      dependencies: ['Demandes de réservations', 'Gestion des utilisateurs'],
      techStack: ['React', 'WebSocket', 'File Storage'],
      businessValue: 'Améliore la satisfaction client et réduit le support',
      risks: ['Sécurité des données client'],
      milestones: [
        { name: 'UX Research', completed: false },
        { name: 'Architecture sécurisée', completed: false },
        { name: 'Développement portail', completed: false }
      ]
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

  const handleCardClick = (itemId: number) => {
    setExpandedCard(expandedCard === itemId ? null : itemId)
  }

  const handleLike = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newLikedItems = new Set(likedItems)
    if (likedItems.has(itemId)) {
      newLikedItems.delete(itemId)
    } else {
      newLikedItems.add(itemId)
    }
    setLikedItems(newLikedItems)
  }

  const handleBookmark = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newBookmarkedItems = new Set(bookmarkedItems)
    if (bookmarkedItems.has(itemId)) {
      newBookmarkedItems.delete(itemId)
    } else {
      newBookmarkedItems.add(itemId)
    }
    setBookmarkedItems(newBookmarkedItems)
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">En cours</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold text-red-600">{stats.highPriority}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Haute priorité</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold text-green-600">{stats.avgProgress}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Progression moy.</div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">Filtres</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'timeline' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Timeline
              </button>
            </div>

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
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        {filteredItems.map((item) => {
          const Icon = item.icon
          const StatusIcon = getStatusIcon(item.status)
          const isExpanded = expandedCard === item.id
          const isLiked = likedItems.has(item.id)
          const isBookmarked = bookmarkedItems.has(item.id)
          
          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] ${
                isExpanded ? 'ring-2 ring-purple-500 shadow-xl' : ''
              }`}
              onClick={() => handleCardClick(item.id)}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                      isExpanded ? 'bg-purple-600' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-6 h-6 transition-colors ${
                        isExpanded ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
                    {/* Action Buttons */}
                    <button
                      onClick={(e) => handleLike(item.id, e)}
                      className={`p-2 rounded-lg transition-colors ${
                        isLiked 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500'
                      }`}
                      title={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={(e) => handleBookmark(item.id, e)}
                      className={`p-2 rounded-lg transition-colors ${
                        isBookmarked 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-blue-500'
                      }`}
                      title={isBookmarked ? 'Retirer des signets' : 'Ajouter aux signets'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-current" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(item.status).split(' ')[0]}`} />
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      isExpanded ? 'rotate-90' : ''
                    }`} />
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

                {/* ETA and Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ETA : {item.eta}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.team}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6 animate-fade-in">
                    {/* Technical Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Détails techniques
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Estimation :</span>
                            <span className="text-gray-900 dark:text-white font-medium">{item.estimatedHours}h</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Stack technique :</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.techStack.map((tech, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Dépendances
                        </h5>
                        {item.dependencies.length > 0 ? (
                          <ul className="space-y-1">
                            {item.dependencies.map((dep, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <GitBranch className="w-3 h-3" />
                                <span>{dep}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-500 italic">Aucune dépendance</p>
                        )}
                      </div>
                    </div>

                    {/* Business Value */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Valeur métier
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.businessValue}
                      </p>
                    </div>

                    {/* Milestones */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Jalons
                      </h5>
                      <div className="space-y-2">
                        {item.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            {milestone.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                            )}
                            <span className={`text-sm ${
                              milestone.completed 
                                ? 'text-gray-900 dark:text-white line-through' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {milestone.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    {item.risks.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Risques identifiés
                        </h5>
                        <ul className="space-y-1">
                          {item.risks.map((risk, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-orange-600 dark:text-orange-400">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Commenter</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Suivre</span>
                        </button>
                      </div>
                      
                      <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">Voir détails</span>
                      </button>
                    </div>
                  </div>
                )}
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
              Roadmap interactive et collaborative
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>
                • <strong>Interaction :</strong> Cliquez sur les cartes pour voir les détails complets
              </p>
              <p>
                • <strong>Favoris :</strong> Marquez vos fonctionnalités préférées avec ❤️
              </p>
              <p>
                • <strong>Signets :</strong> Sauvegardez les éléments importants avec 🔖
              </p>
              <p>
                • <strong>Feedback :</strong> Vos interactions influencent les priorités de développement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Roadmap