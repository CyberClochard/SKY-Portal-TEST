import React, { useState } from 'react'
import { FileText, Upload, Database, Mail, CheckCircle, XCircle, RefreshCw, AlertTriangle, Download, Eye, Trash2, Clock, BarChart3, Settings, Send, FileCheck, TrendingUp, Users, Calendar } from 'lucide-react'

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

  // Fonction pour faire une requête HTTP avec gestion d'erreur
  const makeHttpRequest = async (url: string, data: any, description: string) => {
    console.log(`Envoi de la requête: ${description}`)
    console.log('URL:', url)
    console.log('Data:', data)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-File-Name': selectedFile?.name || '',
        'X-File-Size': selectedFile?.size?.toString() || '',
        'X-Source': 'SkyLogistics-Dashboard'
      },
      body: JSON.stringify(data)
    })

    console.log(`Réponse ${description}:`, response.status)

    if (!response.ok) {
      throw new Error(`Erreur ${description}: ${response.status} ${response.statusText}`)
    }

    const responseText = await response.text()
    console.log(`Réponse brute ${description}:`, responseText)

    if (responseText.trim() === '') {
      return { success: true, message: `${description} terminé` }
    }

    try {
      return JSON.parse(responseText)
    } catch (jsonError) {
      return { success: true, message: responseText || `${description} terminé` }
    }
  }

  const processFile = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF')
      return
    }

    if (!n8nBaseUrl) {
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

      // URLs des deux workflows
      const processingUrl = `https://n8n.skylogistics.fr/webhook-test/57fbc81f-3166-4b75-bcc1-6badbe4ca8cc`
      const unmatchedUrl = `https://n8n.skylogistics.fr/webhook/get-unmatched-items` // Nouveau webhook pour les unmatched

      // Créer FormData pour le fichier principal
      const formData = new FormData()
      formData.append('file', selectedFile)
      Object.entries(commonData).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      // 1. Première requête : Traitement principal du fichier CASS
      console.log('=== REQUÊTE 1: Traitement principal ===')
      const processingResponse = await fetch(processingUrl, {
        method: 'POST',
        headers: {
          'X-File-Name': selectedFile.name,
          'X-File-Size': selectedFile.size.toString(),
          'X-Source': 'SkyLogistics-Dashboard'
        },
        body: formData
      })

      if (!processingResponse.ok) {
        throw new Error(`Erreur traitement principal: ${processingResponse.status} ${processingResponse.statusText}`)
      }

      const processingResult = await processingResponse.text()
      console.log('Résultat traitement principal:', processingResult)

      let mainData
      try {
        mainData = processingResult.trim() ? JSON.parse(processingResult) : {}
      } catch {
        mainData = { message: processingResult }
      }

      // 2. Deuxième requête : Récupération des éléments non trouvés
      console.log('=== REQUÊTE 2: Récupération des unmatched ===')
      const unmatchedResponse = await fetch(unmatchedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'SkyLogistics-Dashboard'
        },
        body: JSON.stringify({
          ...commonData,
          requestType: 'getUnmatched',
          fileName: selectedFile.name
        })
      })

      let unmatchedData = { unmatchedItems: 0, unmatchedRecords: [] }
      
      if (unmatchedResponse.ok) {
        const unmatchedResult = await unmatchedResponse.text()
        console.log('Résultat unmatched:', unmatchedResult)
        
        try {
          if (unmatchedResult.trim()) {
            const parsed = JSON.parse(unmatchedResult)
            unmatchedData = {
              unmatchedItems: parsed.unmatchedItems || parsed.count || 0,
              unmatchedRecords: parsed.unmatchedRecords || parsed.data || []
            }
          }
        } catch {
          console.warn('Impossible de parser la réponse unmatched, utilisation des valeurs par défaut')
        }
      } else {
        console.warn('Erreur lors de la récupération des unmatched, utilisation des valeurs par défaut')
      }

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2)

      // 3. Combiner les résultats des deux requêtes
      const combinedResult: CassProcessingResult = {
        success: true,
        message: 'Traitement terminé avec succès',
        processingTime: `${processingTime}s`,
        data: {
          // Données du traitement principal
          totalItems: mainData.totalItems || mainData.itemCount || mainData.totalLTA || 0,
          totalNetPayable: mainData.totalNetPayable || mainData.totalAmount || '0,00',
          processedItems: mainData.processedItems || mainData.totalItems || 0,
          matchedItems: mainData.matchedItems || mainData.found || 0,
          validationErrors: mainData.validationErrors || mainData.errors?.length || 0,
          duplicates: mainData.duplicates || 0,
          
          // Données des unmatched (deuxième requête)
          unmatchedItems: unmatchedData.unmatchedItems,
          
          // Summary combiné
          summary: {
            totalLTA: mainData.totalItems || mainData.itemCount || 0,
            totalAmount: mainData.totalNetPayable || mainData.totalAmount || '0,00',
            matchRate: mainData.totalItems > 0 ? Math.round(((mainData.totalItems - unmatchedData.unmatchedItems) / mainData.totalItems) * 100) : 0,
            processingTime: `${processingTime}s`,
            fileName: selectedFile.name,
            fileSize: selectedFile.size
          },
          
          // Détails combinés
          details: {
            matched: mainData.details?.matched || mainData.matchedRecords || [],
            unmatched: unmatchedData.unmatchedRecords || [],
            errors: mainData.details?.errors || mainData.validationErrors || []
          }
        },
        
        // Notifications
        notifications: {
          emailSent: mainData.notifications?.emailSent || mainData.emailSent || false,
          reportGenerated: mainData.notifications?.reportGenerated || mainData.reportGenerated || false,
          masterUpdated: mainData.notifications?.masterUpdated || mainData.masterUpdated || false
        }
      }

      setResult(combinedResult)
      setSuccess(`Fichier CASS traité avec succès! ${combinedResult.data?.totalItems || 0} éléments traités, ${unmatchedData.unmatchedItems} non trouvés.`)

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
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>2 Webhooks configurés</span>
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

      {/* Webhook Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Webhook 1 - Traitement principal</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                https://n8n.skylogistics.fr/webhook-test/57fbc81f-3166-4b75-bcc1-6badbe4ca8cc
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Webhook 2 - Récupération des unmatched</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                https://n8n.skylogistics.fr/webhook/get-unmatched-items
              </p>
            </div>
          </div>
        </div>
      </div>

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
                Le fichier sera analysé via 2 workflows : traitement principal + récupération des unmatched
              </p>
            </div>
            <button
              onClick={processFile}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
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
                    {result.data.totalNetPayable || '0,00'}€
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Montant total</p>
                </div>
              </div>

              {/* Summary Information */}
              {result.data.summary && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Résumé du traitement (données combinées)</h4>
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
                        <span>Éléments non trouvés ({result.data.details.unmatched.length}) - Données de la 2ème requête</span>
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
          Architecture à 2 workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">
          <div>
            <h4 className="font-medium mb-2">Workflow 1 - Traitement principal :</h4>
            <ul className="space-y-1 text-xs">
              <li>• Extraction du PDF</li>
              <li>• Analyse des données CASS</li>
              <li>• Correspondances avec Master</li>
              <li>• Calcul des totaux et montants</li>
              <li>• Mise à jour de la base</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Workflow 2 - Récupération unmatched :</h4>
            <ul className="space-y-1 text-xs">
              <li>• Requête séparée pour les unmatched</li>
              <li>• Données détaillées des non trouvés</li>
              <li>• Raisons des échecs de correspondance</li>
              <li>• Combinaison avec les résultats principaux</li>
              <li>• Affichage unifié dans le dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Configuration des 2 webhooks</span>
        </h3>
        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p className="font-medium mb-2">Webhook 1 - Traitement principal :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded font-mono text-xs">
              <p>URL: /webhook-test/57fbc81f-3166-4b75-bcc1-6badbe4ca8cc</p>
              <p>Méthode: POST (FormData avec fichier)</p>
              <p>Retour: Données de traitement principal</p>
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Webhook 2 - Récupération unmatched :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded font-mono text-xs">
              <p>URL: /webhook/get-unmatched-items</p>
              <p>Méthode: POST (JSON)</p>
              <p>Retour: Liste des éléments non trouvés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CassFileProcessor