import React, { useState } from 'react'
import { FileText, Upload, Database, Mail, CheckCircle, XCircle, RefreshCw, AlertTriangle, Download, Eye, Trash2, Clock, BarChart3, Settings } from 'lucide-react'

interface CassProcessingResult {
  success: boolean
  message: string
  data?: {
    totalItems: number
    totalNetPayable: string
    processedItems: number
    unmatchedItems: number
    matchedItems: number
  }
  executionId?: string
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

  // Processing steps for user feedback
  const steps = [
    'Téléchargement du fichier PDF',
    'Extraction du texte du PDF',
    'Nettoyage des données textuelles',
    'Analyse et extraction des valeurs',
    'Formatage des montants',
    'Recherche des correspondances dans le Master',
    'Mise à jour de la base de données',
    'Génération du rapport final',
    'Envoi des notifications par email'
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Veuillez sélectionner un fichier PDF')
        return
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Le fichier est trop volumineux (limite: 50MB)')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setResult(null)
    setError(null)
    setSuccess(null)
    setProcessingSteps([])
    setCurrentStep('')
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
    }, 2000) // 2 seconds per step

    return stepInterval
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
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

    // Start step simulation
    const stepInterval = simulateProcessingSteps()

    try {
      // Convert file to base64 for webhook transmission
      const fileBase64 = await convertFileToBase64(selectedFile)
      
      // Use webhook instead of form trigger
      const webhookUrl = `${n8nBaseUrl}/webhook/cass-file-processing`
      
      console.log('Sending CASS file to webhook:', webhookUrl)
      console.log('File details:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      })

      const payload = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        fileData: fileBase64,
        source: 'SkyLogistics Dashboard',
        timestamp: new Date().toISOString(),
        workflowId: 'cass-file-processing'
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
      }

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      // Parse response
      let data
      if (responseText.trim() === '') {
        // Empty response - workflow might be processing asynchronously
        setSuccess('Fichier CASS envoyé avec succès. Le traitement est en cours...')
        setResult({
          success: true,
          message: 'Traitement en cours',
          data: {
            totalItems: 0,
            totalNetPayable: '0,00',
            processedItems: 0,
            unmatchedItems: 0,
            matchedItems: 0
          }
        })
      } else {
        try {
          data = JSON.parse(responseText)
          
          // Handle successful processing
          if (data && data.success !== false) {
            setSuccess('Fichier CASS traité avec succès!')
            setResult({
              success: true,
              message: 'Traitement terminé',
              data: {
                totalItems: data.totalItems || data.itemCount || 0,
                totalNetPayable: data.totalNetPayable || '0,00',
                processedItems: data.processedItems || data.totalItems || 0,
                unmatchedItems: data.unmatchedItems || 0,
                matchedItems: data.matchedItems || (data.totalItems - data.unmatchedItems) || 0
              },
              executionId: data.executionId
            })
          } else {
            throw new Error(data.message || 'Erreur lors du traitement')
          }
        } catch (jsonError) {
          // If not JSON, treat as success message
          setSuccess('Fichier CASS envoyé avec succès')
          setResult({
            success: true,
            message: responseText || 'Traitement terminé',
            data: {
              totalItems: 0,
              totalNetPayable: '0,00',
              processedItems: 0,
              unmatchedItems: 0,
              matchedItems: 0
            }
          })
        }
      }

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

      {/* N8n Configuration Warning */}
      {!n8nBaseUrl && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Configuration n8n requise</p>
              <p className="text-sm mt-1">Veuillez configurer n8n dans la section "Workflows n8n" pour traiter les fichiers CASS.</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sélection du fichier CASS</h3>
        
        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Télécharger un fichier CASS
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sélectionnez un fichier PDF contenant les données IATA/CASS mensuelles
            </p>
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
                Le fichier sera analysé et les données seront intégrées dans le système Master
              </p>
            </div>
            <button
              onClick={processFile}
              disabled={!n8nBaseUrl}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Database className="w-5 h-5" />
              <span>Traiter le fichier</span>
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {result.success ? 'Traitement terminé' : 'Erreur de traitement'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{result.message}</p>
              </div>
            </div>
          </div>

          {result.success && result.data && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {result.data.totalItems}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total LTA</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {result.data.matchedItems}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Correspondances</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {result.data.unmatchedItems}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Non trouvées</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <Database className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {result.data.processedItems}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Traitées</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {result.data.totalNetPayable}€
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Montant total</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifications automatiques
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  • Rapport d'intégration envoyé par email<br/>
                  • Liste des LTA non trouvées envoyée si applicable<br/>
                  • Mise à jour automatique du fichier Master
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Webhook Configuration Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Configuration n8n requise</span>
        </h3>
        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p className="font-medium mb-2">Modifications à apporter au workflow n8n :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded font-mono text-xs space-y-1">
              <p><strong>1. Remplacer le "Form Trigger" par un "Webhook"</strong></p>
              <p>   • URL: /webhook/cass-file-processing</p>
              <p>   • Méthode: POST</p>
              <p>   • Authentification: Aucune</p>
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-2">Structure des données reçues :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded font-mono text-xs">
              <p>fileName: "fichier.pdf"</p>
              <p>fileSize: 1234567</p>
              <p>fileType: "application/pdf"</p>
              <p>fileData: "base64_encoded_pdf_content"</p>
              <p>source: "SkyLogistics Dashboard"</p>
              <p>timestamp: "2025-01-XX..."</p>
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Traitement du fichier base64 :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded text-xs">
              <p>• Ajouter un nœud "Code" après le webhook pour décoder le base64</p>
              <p>• Convertir en buffer pour le nœud "Extract from File"</p>
              <p>• Le reste du workflow reste identique</p>
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Réponse attendue (optionnel) :</p>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded font-mono text-xs">
              <p>{`{`}</p>
              <p>  "success": true,</p>
              <p>  "totalItems": 45,</p>
              <p>  "totalNetPayable": "12.345,67",</p>
              <p>  "unmatchedItems": 3</p>
              <p>{`}`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Information */}
      <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Fonctionnalités du traitement CASS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">
          <div>
            <h4 className="font-medium mb-2">Extraction automatique :</h4>
            <ul className="space-y-1 text-xs">
              <li>• Routing (codes aéroport)</li>
              <li>• Numéros AWB/LTA</li>
              <li>• Poids des expéditions</li>
              <li>• Montants nets payables</li>
              <li>• Dates des opérations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Intégration intelligente :</h4>
            <ul className="space-y-1 text-xs">
              <li>• Correspondance avec fichier Master</li>
              <li>• Mise à jour automatique des montants CASS</li>
              <li>• Gestion des éléments non trouvés</li>
              <li>• Rapports par email automatiques</li>
              <li>• Validation et nettoyage des données</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CassFileProcessor