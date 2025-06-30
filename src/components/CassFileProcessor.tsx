import React, { useState } from 'react'
import { FileText, Upload, Database, Mail, CheckCircle, XCircle, RefreshCw, AlertTriangle, Download, Eye, Trash2, Clock, BarChart3, Settings, Send, FileCheck, TrendingUp, Users, Calendar, Table, ExternalLink } from 'lucide-react'

interface CassProcessingResult {
  success: boolean
  message: string
  data?: {
    totalItems?: number
    totalNetPayable?: string
    processedItems?: number
    unmatchedItems?: number
    matchedItems?: number
    validationErrors?: number
    duplicates?: number
    summary?: {
      totalLTA?: number
      totalAmount?: string
      matchRate?: number
      processingTime?: string
      fileName?: string
      fileSize?: number
    }
    details?: {
      matched?: Array<{
        lta: string
        amount: string
        status: string
      }>
      unmatched?: Array<{
        lta: string
        amount: string
        reason: string
      }>
      errors?: Array<{
        line: number
        error: string
        data: string
      }>
    }
    // Nouvelles données du webhook n8n
    unmatched?: any
    rawResponse?: any
  }
  executionId?: string
  processingTime?: string
  notifications?: {
    emailSent?: boolean
    reportGenerated?: boolean
    masterUpdated?: boolean
  }
}

interface CassFileProcessorProps {
  n8nBaseUrl?: string
}

const CassFileProcessor: React.FC<CassFileProcessorProps> = ({ n8nBaseUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<CassProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processingSteps, setProcessingSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showUnmatchedTable, setShowUnmatchedTable] = useState(false)

  // Get n8n configuration from localStorage
  const getN8nConfig = () => {
    const baseUrl = localStorage.getItem('n8n_base_url') || 'https://n8n.skylogistics.fr'
    return baseUrl
  }

  // Processing steps for user feedback
  const steps = [
    'Téléchargement du fichier PDF',
    'Extraction du texte du PDF',
    'Nettoyage des données textuelles',
    'Analyse et extraction des valeurs',
    'Formatage des montants',
    'Recherche des correspondances dans le Master',
    'Récupération des données non trouvées',
    'Mise à jour de la base de données',
    'Génération du rapport final',
    'Envoi des notifications par email'
  ]

  const validateFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Veuillez sélectionner un fichier PDF')
      return false
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('Le fichier est trop volumineux (limite: 50MB)')
      return false
    }
    return true
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && validateFile(file)) {
      setSelectedFile(file)
      setError(null)
      setResult(null) // Clear previous results
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setError(null)
        setResult(null) // Clear previous results
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setResult(null)
    setError(null)
    setSuccess(null)
    setProcessingSteps([])
    setCurrentStep('')
    setShowDetails(false)
    setShowUnmatchedTable(false)
  }

  const simulateProcessingSteps = () => {
    let stepIndex = 0
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex])
        setProcessingSteps(prev => [...prev, steps[stepIndex]])
        stepIndex++
      } else {
        clearInterval(stepInterval)
        setCurrentStep('')
      }
    }, 1500) // 1.5 seconds per step

    return stepInterval
  }

  // Fonction pour parser les données du webhook n8n
  const parseN8nResponse = (data: any) => {
    console.log('Parsing n8n response:', data)
    
    // Extraire les valeurs selon le format de votre webhook
    const totalItems = parseInt(data.totalItems) || 0
    const totalNetPayable = data.totalNetPayable || '0.00'
    const matchedItems = parseInt(data.matchedItems) || 0
    const unmatchedItems = parseInt(data.unmatchedItems) || 0
    
    // Calculer le taux de correspondance
    const matchRate = totalItems > 0 ? Math.round((matchedItems / totalItems) * 100) : 0
    
    // Traiter le champ unmatched qui contient des données supplémentaires
    let additionalData = {}
    if (data.unmatched) {
      try {
        // Si unmatched est une chaîne JSON, la parser
        if (typeof data.unmatched === 'string') {
          additionalData = JSON.parse(data.unmatched)
        } else {
          additionalData = data.unmatched
        }
      } catch (e) {
        console.warn('Impossible de parser unmatched:', e)
        additionalData = { raw: data.unmatched }
      }
    }

    return {
      totalItems,
      totalNetPayable: `€${totalNetPayable}`,
      matchedItems,
      unmatchedItems,
      processedItems: totalItems,
      validationErrors: 0, // À adapter selon vos données
      duplicates: 0, // À adapter selon vos données
      summary: {
        totalLTA: totalItems,
        totalAmount: `€${totalNetPayable}`,
        matchRate,
        fileName: selectedFile?.name || 'Unknown',
        fileSize: selectedFile?.size || 0
      },
      details: {
        matched: [], // À remplir avec les données détaillées si disponibles
        unmatched: [], // À remplir avec les données détaillées si disponibles
        errors: [] // À remplir avec les erreurs si disponibles
      },
      // Conserver les données brutes pour débogage
      rawResponse: data,
      unmatched: additionalData
    }
  }

  // Fonction pour analyser et structurer les données unmatched
  const parseUnmatchedData = (unmatchedData: any) => {
    if (!unmatchedData) return null

    // Si c'est un tableau d'objets (format structuré)
    if (Array.isArray(unmatchedData)) {
      return {
        type: 'structured',
        items: unmatchedData,
        count: unmatchedData.length
      }
    }

    // Si c'est un objet avec des propriétés
    if (typeof unmatchedData === 'object') {
      // Chercher des tableaux dans l'objet
      const arrays = Object.entries(unmatchedData).filter(([key, value]) => Array.isArray(value))
      
      if (arrays.length > 0) {
        return {
          type: 'object_with_arrays',
          data: unmatchedData,
          arrays: arrays.map(([key, value]) => ({ key, items: value as any[], count: (value as any[]).length }))
        }
      }

      // Objet simple
      return {
        type: 'object',
        data: unmatchedData,
        entries: Object.entries(unmatchedData)
      }
    }

    // Données brutes (string, number, etc.)
    return {
      type: 'raw',
      data: unmatchedData
    }
  }

  // Fonction pour rendre le tableau des unmatched
  const renderUnmatchedTable = (unmatchedData: any) => {
    const parsedData = parseUnmatchedData(unmatchedData)
    
    if (!parsedData) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucune donnée unmatched disponible
        </div>
      )
    }

    switch (parsedData.type) {
      case 'structured':
        // Tableau d'objets structurés
        if (parsedData.items.length === 0) {
          return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun élément non trouvé
            </div>
          )
        }

        // Déterminer les colonnes à partir du premier élément
        const columns = Object.keys(parsedData.items[0])
        
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {parsedData.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    {columns.map((column) => (
                      <td key={column} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {typeof item[column] === 'object' ? 
                          JSON.stringify(item[column]) : 
                          String(item[column] || '-')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'object_with_arrays':
        // Objet contenant des tableaux
        return (
          <div className="space-y-6">
            {parsedData.arrays.map(({ key, items, count }) => (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {key} ({count} éléments)
                  </h5>
                </div>
                <div className="p-4">
                  {items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              #
                            </th>
                            {Object.keys(items[0]).map((column) => (
                              <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {index + 1}
                              </td>
                              {Object.keys(items[0]).map((column) => (
                                <td key={column} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {typeof item[column] === 'object' ? 
                                    JSON.stringify(item[column]) : 
                                    String(item[column] || '-')
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Aucun élément dans {key}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Afficher les autres propriétés non-array */}
            {Object.entries(parsedData.data).filter(([key, value]) => !Array.isArray(value)).length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    Autres propriétés
                  </h5>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(parsedData.data)
                      .filter(([key, value]) => !Array.isArray(value))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'object':
        // Objet simple
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedData.entries.map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                <span className="text-gray-900 dark:text-white">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )

      case 'raw':
        // Données brutes
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {typeof parsedData.data === 'object' ? 
                JSON.stringify(parsedData.data, null, 2) : 
                String(parsedData.data)
              }
            </pre>
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Format de données non reconnu
          </div>
        )
    }
  }

  const processFile = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF')
      return
    }

    // Get current n8n configuration
    const currentN8nBaseUrl = getN8nConfig()
    
    if (!currentN8nBaseUrl || currentN8nBaseUrl.trim() === '') {
      setError('Configuration n8n requise. Veuillez configurer n8n dans la section Workflows.')
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(null)
    setResult(null)
    setProcessingSteps([])
    setCurrentStep('')
    setShowDetails(false)
    setShowUnmatchedTable(false)

    // Start step simulation
    const stepInterval = simulateProcessingSteps()

    try {
      const startTime = Date.now()

      // Préparer les données communes
      const commonData = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        source: 'SkyLogistics Dashboard',
        timestamp: new Date().toISOString(),
        uploadedBy: 'Admin',
        processingMode: 'production'
      }

      // URL du webhook unique
      const webhookUrl = `${currentN8nBaseUrl}/webhook-test/57fbc81f-3166-4b75-bcc1-6badbe4ca8cc`

      // Créer FormData pour le fichier
      const formData = new FormData()
      formData.append('file', selectedFile)
      Object.entries(commonData).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      console.log('=== REQUÊTE: Traitement CASS complet ===')
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'X-File-Name': selectedFile.name,
          'X-File-Size': selectedFile.size.toString(),
          'X-Source': 'SkyLogistics-Dashboard'
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Erreur traitement: ${response.status} ${response.statusText}`)
      }

      const responseText = await response.text()
      console.log('Résultat traitement:', responseText)

      let data
      try {
        data = responseText.trim() ? JSON.parse(responseText) : {}
      } catch {
        data = { message: responseText }
      }

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2)

      // Parser les données selon le nouveau format
      const parsedData = parseN8nResponse(data)
      parsedData.summary!.processingTime = `${processingTime}s`

      // Construire le résultat final
      const finalResult: CassProcessingResult = {
        success: true,
        message: 'Traitement terminé avec succès',
        processingTime: `${processingTime}s`,
        data: parsedData,
        
        // Notifications (à adapter selon vos données)
        notifications: {
          emailSent: data.notifications?.emailSent || false,
          reportGenerated: data.notifications?.reportGenerated || false,
          masterUpdated: data.notifications?.masterUpdated || false
        }
      }

      setResult(finalResult)
      setSuccess(`Fichier CASS traité avec succès! ${finalResult.data?.totalItems || 0} éléments traités, ${finalResult.data?.unmatchedItems || 0} non trouvés.`)

    } catch (err) {
      console.error('Processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur lors du traitement: ${errorMessage}`)
      setResult({
        success: false,
        message: errorMessage
      })
    } finally {
      clearInterval(stepInterval)
      setProcessing(false)
      setCurrentStep('')
      setTimeout(() => setSuccess(null), 10000)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const exportResults = () => {
    if (!result?.data) return

    const csvContent = [
      ['Métrique', 'Valeur'].join(','),
      ['Total LTA', result.data.totalItems?.toString() || '0'].join(','),
      ['Montant Total', result.data.totalNetPayable || '0,00'].join(','),
      ['Correspondances', result.data.matchedItems?.toString() || '0'].join(','),
      ['Non trouvées', result.data.unmatchedItems?.toString() || '0'].join(','),
      ['Erreurs', result.data.validationErrors?.toString() || '0'].join(','),
      ['Doublons', result.data.duplicates?.toString() || '0'].join(','),
      ['Temps de traitement', result.processingTime || 'N/A'].join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cass_results_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get current n8n configuration for display
  const currentN8nBaseUrl = getN8nConfig()
  const isN8nConfigured = currentN8nBaseUrl && currentN8nBaseUrl.trim() !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Traitement Fichier CASS</h2>
            <p className="text-gray-600 dark:text-gray-400">Extraction et intégration des données IATA/CASS</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isN8nConfigured 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isN8nConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isN8nConfigured ? 'Webhook configuré' : 'Configuration n8n requise'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erreur de traitement</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* N8n Configuration Status */}
      {isN8nConfigured ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Webhook de traitement CASS</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                {currentN8nBaseUrl}/webhook-test/57fbc81f-3166-4b75-bcc1-6badbe4ca8cc
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Traitement complet : extraction PDF, correspondances Master, récupération unmatched, notifications
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
            <Settings className="w-5 h-5" />
            <div>
              <p className="font-medium">Configuration n8n requise</p>
              <p className="text-sm mt-1">Veuillez configurer l'URL de base n8n dans la section "Workflows n8n" pour pouvoir traiter les fichiers CASS.</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sélection du fichier CASS</h3>
        
        {!selectedFile ? (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : 'scale-100'}`}>
              <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${
                isDragOver 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-400 dark:text-gray-600'
              }`} />
              <h4 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                isDragOver 
                  ? 'text-blue-900 dark:text-blue-100' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {isDragOver ? 'Déposez le fichier ici' : 'Télécharger un fichier CASS'}
              </h4>
              <p className={`mb-4 transition-colors duration-300 ${
                isDragOver 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {isDragOver 
                  ? 'Relâchez pour télécharger le fichier PDF' 
                  : 'Glissez-déposez un fichier PDF ou cliquez pour sélectionner'
                }
              </p>
              {!isDragOver && (
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir un fichier
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={processing}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Formats acceptés: PDF • Taille max: 50MB
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(selectedFile.size)} • PDF
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                disabled={processing}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Processing Steps */}
      {processing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traitement en cours</h3>
          
          {currentStep && (
            <div className="flex items-center space-x-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">{currentStep}</span>
            </div>
          )}

          <div className="space-y-2">
            {steps.map((step, index) => {
              const isCompleted = processingSteps.includes(step)
              const isCurrent = currentStep === step
              
              return (
                <div key={index} className={`flex items-center space-x-3 p-2 rounded ${
                  isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : 
                  isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 
                  'bg-gray-50 dark:bg-gray-900'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                  )}
                  <span className={`text-sm ${
                    isCurrent ? 'text-blue-800 dark:text-blue-200 font-medium' :
                    isCompleted ? 'text-green-800 dark:text-green-200' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Process Button */}
      {selectedFile && !processing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prêt pour le traitement</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Le fichier sera analysé via le workflow n8n complet : extraction, correspondances, unmatched et notifications
              </p>
            </div>
            <button
              onClick={processFile}
              disabled={!isN8nConfigured}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Database className="w-5 h-5" />
              <span>Traiter le fichier</span>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Results Display */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.success ? 'Traitement terminé avec succès' : 'Erreur de traitement'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{result.message}</p>
                  {result.processingTime && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Temps de traitement: {result.processingTime}
                    </p>
                  )}
                </div>
              </div>
              
              {result.success && result.data && (
                <div className="flex items-center space-x-2">
                  {result.data.unmatched && (
                    <button
                      onClick={() => setShowUnmatchedTable(!showUnmatchedTable)}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      <Table className="w-4 h-4" />
                      <span>{showUnmatchedTable ? 'Masquer' : 'Tableau'} Unmatched</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showDetails ? 'Masquer' : 'Détails'}</span>
                  </button>
                  <button
                    onClick={exportResults}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exporter</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {result.success && result.data && (
            <div className="p-6">
              {/* Main Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {result.data.totalItems || 0}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total LTA</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {result.data.matchedItems || 0}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Correspondances</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {result.data.unmatchedItems || 0}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Non trouvées</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {result.data.validationErrors || 0}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">Erreurs</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {result.data.duplicates || 0}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Doublons</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {result.data.totalNetPayable || '€0,00'}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Montant total</p>
                </div>
              </div>

              {/* Unmatched Table Display */}
              {showUnmatchedTable && result.data.unmatched && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700 mb-6">
                  <div className="p-4 border-b border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Table className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                          Tableau des éléments non trouvés (Unmatched)
                        </h4>
                      </div>
                      <button
                        onClick={() => setShowUnmatchedTable(false)}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Données détaillées des éléments qui n'ont pas pu être traités automatiquement
                    </p>
                  </div>
                  <div className="p-4">
                    {renderUnmatchedTable(result.data.unmatched)}
                  </div>
                </div>
              )}

              {/* Summary Information */}
              {result.data.summary && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Résumé du traitement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fichier:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{result.data.summary.fileName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Taille:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {result.data.summary.fileSize ? formatFileSize(result.data.summary.fileSize) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Taux de correspondance:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {result.data.summary.matchRate || 0}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Temps de traitement:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {result.data.summary.processingTime || result.processingTime || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Status */}
              {result.notifications && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Statut des notifications
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {result.notifications.emailSent ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">Email envoyé</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.notifications.reportGenerated ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">Rapport généré</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.notifications.masterUpdated ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">Master mis à jour</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Data Debug (when details are shown) */}
              {showDetails && result.data.rawResponse && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Données brutes du webhook n8n</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-x-auto">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(result.data.rawResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Detailed Results */}
              {showDetails && result.data.details && (
                <div className="space-y-4">
                  {/* Matched Items */}
                  {result.data.details.matched && result.data.details.matched.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Correspondances trouvées ({result.data.details.matched.length})</span>
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        <div className="space-y-2">
                          {result.data.details.matched.slice(0, 10).map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded">
                              <span className="font-mono">{item.lta}</span>
                              <span className="font-medium">{item.amount}</span>
                              <span className="text-green-600 dark:text-green-400">{item.status}</span>
                            </div>
                          ))}
                          {result.data.details.matched.length > 10 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              ... et {result.data.details.matched.length - 10} autres
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Unmatched Items */}
                  {result.data.details.unmatched && result.data.details.unmatched.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Éléments non trouvés ({result.data.details.unmatched.length})</span>
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        <div className="space-y-2">
                          {result.data.details.unmatched.slice(0, 10).map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded">
                              <span className="font-mono">{item.lta}</span>
                              <span className="font-medium">{item.amount}</span>
                              <span className="text-yellow-600 dark:text-yellow-400 text-xs">{item.reason}</span>
                            </div>
                          ))}
                          {result.data.details.unmatched.length > 10 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              ... et {result.data.details.unmatched.length - 10} autres
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Validation Errors */}
                  {result.data.details.errors && result.data.details.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 dark:text-red-100 mb-3 flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span>Erreurs de validation ({result.data.details.errors.length})</span>
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        <div className="space-y-2">
                          {result.data.details.errors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-sm bg-white dark:bg-gray-800 p-2 rounded">
                              <div className="flex justify-between items-start">
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  Ligne {error.line}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {error.data}
                                </span>
                              </div>
                              <p className="text-red-700 dark:text-red-300 mt-1">{error.error}</p>
                            </div>
                          ))}
                          {result.data.details.errors.length > 5 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              ... et {result.data.details.errors.length - 5} autres erreurs
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Workflow Information */}
      <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Workflow n8n unifié
        </h3>
        <div className="text-sm text-gray-800 dark:text-gray-200">
          <h4 className="font-medium mb-2">Traitement complet en un seul workflow :</h4>
          <ul className="space-y-1 text-xs ml-4">
            <li>• Extraction du PDF et analyse des données CASS</li>
            <li>• Recherche des correspondances dans le Master</li>
            <li>• Récupération automatique des éléments non trouvés</li>
            <li>• Calcul des totaux, montants et statistiques</li>
            <li>• Mise à jour de la base de données</li>
            <li>• Génération de rapports et envoi de notifications</li>
            <li>• Retour des données complètes au dashboard</li>
          </ul>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Configuration du webhook</span>
        </h3>
        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p className="font-medium mb-2">Webhook unique de traitement CASS :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded font-mono text-xs">
              <p>URL: {isN8nConfigured ? `${currentN8nBaseUrl}/webhook-test/57fbc81f-3166-4b75-bcc1-6badbe4ca8cc` : 'Configuration requise'}</p>
              <p>Méthode: POST (FormData avec fichier PDF)</p>
              <p>Retour attendu: JSON avec totalItems, totalNetPayable, matchedItems, unmatchedItems, unmatched</p>
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Variables attendues dans la réponse :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded font-mono text-xs">
              <p>• totalItems: "134" (nombre total d'éléments)</p>
              <p>• totalNetPayable: "112406.94" (montant total)</p>
              <p>• matchedItems: "" (éléments trouvés)</p>
              <p>• unmatchedItems: "1" (éléments non trouvés)</p>
              <p>• unmatched: {`{{ $json }}`} (objet JSON avec données détaillées des unmatched)</p>
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Affichage du tableau unmatched :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded text-xs">
              <p>• Le bouton "Tableau Unmatched" apparaît si des données unmatched sont présentes</p>
              <p>• Supporte les formats : tableau d'objets, objet avec tableaux, objet simple, données brutes</p>
              <p>• Affichage adaptatif selon la structure des données reçues</p>
              <p>• Colonnes générées automatiquement à partir des clés des objets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CassFileProcessor