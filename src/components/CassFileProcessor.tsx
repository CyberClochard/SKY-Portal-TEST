import React, { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, RefreshCw, Download, Eye, Settings, Table, X } from 'lucide-react'

interface CassProcessingResult {
  totalItems?: string | number
  matchedItems?: string | number
  unmatchedItems?: string | number
  totalNetPayable?: string | number
  unmatched?: any
  [key: string]: any
}

interface CassFileProcessorProps {
  n8nBaseUrl?: string
}

const CassFileProcessor: React.FC<CassFileProcessorProps> = ({ n8nBaseUrl }) => {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<CassProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showUnmatchedTable, setShowUnmatchedTable] = useState(false)
  const [unmatchedDisplayFormat, setUnmatchedDisplayFormat] = useState<'table' | 'cards'>('table')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get n8n configuration from localStorage
  const getN8nConfig = () => {
    const baseUrl = localStorage.getItem('n8n_base_url') || 'https://n8n.skylogistics.fr'
    return baseUrl
  }

  const currentN8nBaseUrl = getN8nConfig()
  const isN8nConfigured = currentN8nBaseUrl && currentN8nBaseUrl.trim() !== ''

  // Helper function to filter out 'id' column from display
  const filterDisplayColumns = (data: any) => {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'object' && item !== null) {
          const { id, ...filteredItem } = item
          return filteredItem
        }
        return item
      })
    }
    
    if (typeof data === 'object' && data !== null) {
      const { id, ...filteredData } = data
      return filteredData
    }
    
    return data
  }

  // Helper function to get display columns (excluding 'id')
  const getDisplayColumns = (data: any[]) => {
    const allKeys = new Set<string>()
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => {
          if (key !== 'id') { // Exclure la colonne 'id'
            allKeys.add(key)
          }
        })
      }
    })
    return Array.from(allKeys)
  }

  // Format amount with thousands separator and euro symbol
  const formatAmount = (amount: string | number) => {
    if (!amount) return '€0'
    
    const numStr = String(amount).replace(/[^\d,.-]/g, '')
    const num = parseFloat(numStr.replace(',', '.'))
    
    if (isNaN(num)) return '€0'
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      setResult(null)
      setError(null)
      setSuccess(null)
      setDebugInfo(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
      setSuccess(null)
      setDebugInfo(null)
    }
  }

  const processFile = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    if (!isN8nConfigured) {
      setError('Configuration n8n requise. Veuillez configurer n8n dans la section Workflows.')
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(null)
    setDebugInfo(null)

    try {
      const webhookUrl = `${currentN8nBaseUrl}/webhook-test/57fbc81f-3166-4b75-bcc1-6badbe4ca8cc`
      
      console.log('Sending file to:', webhookUrl)
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)
      formData.append('fileSize', file.size.toString())
      formData.append('fileType', file.type)
      formData.append('source', 'SkyLogistics Dashboard')
      formData.append('timestamp', new Date().toISOString())

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
      }

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      setDebugInfo({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: responseText,
        url: webhookUrl
      })

      let data
      if (responseText.trim() === '') {
        setError('Réponse vide du workflow n8n')
        return
      }

      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        setError(`Réponse JSON invalide du workflow n8n. Réponse reçue: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`)
        return
      }

      console.log('=== DEBUGGING UNMATCHED DATA ===')
      console.log('Parsed data:', data)
      console.log('Raw unmatched data:', data.unmatched)
      console.log('Type of unmatched:', typeof data.unmatched)
      console.log('Is array?', Array.isArray(data.unmatched))

      // Traitement spécial pour la variable "unmatched" avec le nouveau format
      if (data.unmatched !== undefined) {
        let unmatchedData = data.unmatched
        
        console.log('=== PROCESSING UNMATCHED ===')
        console.log('Original unmatched:', unmatchedData)
        
        // Si c'est un tableau d'objets avec structure {json: {...}, pairedItem: {...}}
        if (Array.isArray(unmatchedData)) {
          console.log('Unmatched is array, checking for json structure...')
          
          // Vérifier si chaque élément a une propriété 'json'
          const hasJsonStructure = unmatchedData.every(item => 
            typeof item === 'object' && 
            item !== null && 
            item.hasOwnProperty('json')
          )
          
          if (hasJsonStructure) {
            console.log('Found json structure, extracting json data...')
            // Extraire les données du champ 'json' de chaque élément
            const extractedData = unmatchedData.map(item => {
              if (typeof item.json === 'string') {
                try {
                  return JSON.parse(item.json)
                } catch (e) {
                  console.warn('Failed to parse json string:', item.json)
                  return item.json
                }
              }
              return item.json
            })
            
            console.log('Extracted data from json fields:', extractedData)
            data.unmatched = extractedData
          } else {
            console.log('No json structure found, keeping original array')
          }
        }
        // Si c'est une string qui ressemble à du JSON, essayer de la parser
        else if (typeof unmatchedData === 'string') {
          console.log('Unmatched is string, attempting to parse...')
          
          let cleanedString = unmatchedData.trim()
          
          try {
            // Méthode 1: Parse direct
            const parsed1 = JSON.parse(cleanedString)
            console.log('Method 1 - Direct parse successful:', parsed1)
            data.unmatched = parsed1
          } catch (e1) {
            console.log('Method 1 failed:', e1.message)
            
            try {
              // Méthode 2: Remplacer les guillemets simples par doubles
              const cleaned2 = cleanedString.replace(/'/g, '"')
              const parsed2 = JSON.parse(cleaned2)
              console.log('Method 2 - Quote replacement successful:', parsed2)
              data.unmatched = parsed2
            } catch (e2) {
              console.log('Method 2 failed:', e2.message)
              console.log('All parsing methods failed, keeping original string')
            }
          }
        }
        
        console.log('Final unmatched data:', data.unmatched)
        console.log('Final type:', typeof data.unmatched)
        console.log('Final is array?', Array.isArray(data.unmatched))
        if (Array.isArray(data.unmatched)) {
          console.log('Array length:', data.unmatched.length)
          console.log('First element:', data.unmatched[0])
        }
      }

      setResult(data)
      setSuccess('Fichier traité avec succès')

    } catch (err) {
      console.error('Processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur lors du traitement: ${errorMessage}`)
    } finally {
      setProcessing(false)
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  const exportResults = () => {
    if (!result) return

    const csvContent = [
      ['Métrique', 'Valeur'].join(','),
      ['Total LTA', result.totalItems || 'N/A'].join(','),
      ['Correspondances', result.matchedItems || 'N/A'].join(','),
      ['Non trouvés', result.unmatchedItems || 'N/A'].join(','),
      ['Montant total', result.totalNetPayable || 'N/A'].join(','),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cass_processing_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format 1: Tableau classique
  const renderTableFormat = (unmatchedData: any) => {
    if (Array.isArray(unmatchedData)) {
      if (unmatchedData.length === 0) {
        return <div className="text-center py-8"><p className="text-gray-500">Tableau vide</p></div>
      }

      // Utiliser la fonction helper pour obtenir les colonnes sans 'id'
      const columns = getDisplayColumns(unmatchedData)

      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-yellow-100 dark:bg-yellow-900/30">
                <th className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-left text-sm font-medium text-yellow-800 dark:text-yellow-200">#</th>
                {columns.map(column => (
                  <th key={column} className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-left text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unmatchedData.map((item, index) => (
                <tr key={index} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                  <td className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  {columns.map(column => (
                    <td key={column} className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {typeof item === 'object' && item !== null ? (
                        typeof item[column] === 'object' ? 
                          JSON.stringify(item[column]) : 
                          String(item[column] || '')
                      ) : (
                        String(item || '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (typeof unmatchedData === 'object' && unmatchedData !== null) {
      // Filtrer l'objet pour exclure 'id'
      const filteredData = filterDisplayColumns(unmatchedData)
      const entries = Object.entries(filteredData)
      
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-yellow-100 dark:bg-yellow-900/30">
                <th className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-left text-sm font-medium text-yellow-800 dark:text-yellow-200">Propriété</th>
                <th className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-left text-sm font-medium text-yellow-800 dark:text-yellow-200">Valeur</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, value]) => (
                <tr key={key} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                  <td className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{key}</td>
                  <td className="border border-yellow-300 dark:border-yellow-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"><pre>{String(unmatchedData)}</pre></div>
  }

  // Format 2: Cartes
  const renderCardsFormat = (unmatchedData: any) => {
    if (Array.isArray(unmatchedData)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unmatchedData.map((item, index) => {
            // Filtrer l'item pour exclure 'id'
            const filteredItem = typeof item === 'object' && item !== null ? filterDisplayColumns(item) : item
            
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-300 dark:border-yellow-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {typeof item === 'object' && item !== null && item.awb ? 
                      `AWB: ${item.awb}` : 
                      `Élément #${index + 1}`
                    }
                  </h4>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                {typeof filteredItem === 'object' && filteredItem !== null ? (
                  <div className="space-y-2">
                    {Object.entries(filteredItem).slice(0, 6).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{key}</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {key === 'netPayable' && typeof value === 'string' ? 
                            formatAmount(value) : 
                            typeof value === 'object' ? JSON.stringify(value) : String(value)
                          }
                        </p>
                      </div>
                    ))}
                    {Object.keys(filteredItem).length > 6 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">... et {Object.keys(filteredItem).length - 6} autres propriétés</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-900 dark:text-gray-100">{String(filteredItem)}</p>
                )}
              </div>
            )
          })}
        </div>
      )
    }

    if (typeof unmatchedData === 'object' && unmatchedData !== null) {
      const filteredData = filterDisplayColumns(unmatchedData)
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(filteredData).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-300 dark:border-yellow-700 shadow-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{key}</h4>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {typeof value === 'object' ? (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <p>{String(value)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    return <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-300 dark:border-yellow-700"><pre>{String(unmatchedData)}</pre></div>
  }

  // Fonction principale pour rendre les données unmatched
  const renderUnmatchedData = () => {
    if (!result?.unmatched) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée unmatched à afficher</p>
        </div>
      )
    }

    const unmatchedData = result.unmatched
    console.log('Rendering unmatched with format:', unmatchedDisplayFormat, 'Data:', unmatchedData)

    switch (unmatchedDisplayFormat) {
      case 'table':
        return renderTableFormat(unmatchedData)
      case 'cards':
        return renderCardsFormat(unmatchedData)
      default:
        return renderTableFormat(unmatchedData)
    }
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
            <p className="text-gray-600 dark:text-gray-400">Analyse et traitement automatique des fichiers CASS</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isN8nConfigured 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isN8nConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isN8nConfigured ? 'n8n configuré' : 'Configuration requise'}</span>
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

      {/* Configuration Status */}
      {!isN8nConfigured && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
            <Settings className="w-5 h-5" />
            <div>
              <p className="font-medium">Configuration n8n requise</p>
              <p className="text-sm mt-1">Veuillez configurer l'URL de base n8n dans la section "Workflows n8n" pour traiter les fichiers CASS.</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      {!result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sélectionner un fichier CASS</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Formats supportés: PDF, Excel, CSV</p>
            
            <div className="max-w-md mx-auto">
              <div
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30'
                    : 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-orange-500" />
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.xlsx,.xls,.csv"
                />
              </div>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={processFile}
              disabled={!file || processing || !isN8nConfigured}
              className="mt-6 flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors mx-auto"
            >
              {processing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span>{processing ? 'Traitement en cours...' : 'Traiter le fichier'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {processing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Traitement en cours</h3>
              <p className="text-blue-700 dark:text-blue-300">Le fichier est en cours d'analyse via le workflow n8n : extraction, correspondances et notifications</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Success Header */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Traitement terminé avec succès</h3>
                  <p className="text-green-700 dark:text-green-300">Fichier analysé et traité automatiquement</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {result.unmatched && (
                  <button
                    onClick={() => setShowUnmatchedTable(!showUnmatchedTable)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    <Table className="w-4 h-4" />
                    <span>{showUnmatchedTable ? 'Masquer' : 'Afficher'} Unmatched</span>
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Détails</span>
                </button>
                <button
                  onClick={exportResults}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.totalItems || '0'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total LTA</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.matchedItems || '0'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Correspondances</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.unmatchedItems || '0'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Non trouvés</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white break-words">
                {formatAmount(result.totalNetPayable || '0')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant total</p>
            </div>
          </div>

          {/* Unmatched Data Display */}
          {showUnmatchedTable && result.unmatched && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-yellow-300 dark:border-yellow-700 shadow-sm">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 px-6 py-4 border-b border-yellow-300 dark:border-yellow-700 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Table className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                      Données Unmatched ({Array.isArray(result.unmatched) ? result.unmatched.length : 1} élément{Array.isArray(result.unmatched) && result.unmatched.length > 1 ? 's' : ''})
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Format Selection Buttons */}
                    <div className="flex bg-yellow-200 dark:bg-yellow-800 rounded-lg p-1">
                      <button
                        onClick={() => setUnmatchedDisplayFormat('table')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                          unmatchedDisplayFormat === 'table' 
                            ? 'bg-yellow-600 text-white' 
                            : 'text-yellow-700 dark:text-yellow-300 hover:bg-yellow-300 dark:hover:bg-yellow-700'
                        }`}
                      >
                        <Table className="w-3 h-3" />
                        <span>Tableau</span>
                      </button>
                      <button
                        onClick={() => setUnmatchedDisplayFormat('cards')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                          unmatchedDisplayFormat === 'cards' 
                            ? 'bg-yellow-600 text-white' 
                            : 'text-yellow-700 dark:text-yellow-300 hover:bg-yellow-300 dark:hover:bg-yellow-700'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        <span>Cartes</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowUnmatchedTable(false)}
                      className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                  Données détaillées des éléments qui n'ont pas pu être traités automatiquement (colonne ID masquée)
                </p>
              </div>
              <div className="p-6">
                {renderUnmatchedData()}
              </div>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && showDetails && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Informations de débogage (cliquez pour développer)
                </summary>
                <div className="space-y-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p><strong>URL:</strong> {debugInfo.url}</p>
                  <p><strong>Status:</strong> {debugInfo.status}</p>
                  <p><strong>Headers:</strong> {JSON.stringify(debugInfo.headers, null, 2)}</p>
                  <p><strong>Réponse brute:</strong></p>
                  <pre className="whitespace-pre-wrap break-all">{debugInfo.rawResponse}</pre>
                </div>
              </details>
            </div>
          )}

          {/* Processing Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Résumé du traitement</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Fichier:</p>
                <p className="text-gray-900 dark:text-white font-medium">{file?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Taille:</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Taux de correspondance:</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {result.totalItems && result.matchedItems ? 
                    `${Math.round((Number(result.matchedItems) / Number(result.totalItems)) * 100)}%` : 
                    '0%'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Statut:</p>
                <p className="text-gray-900 dark:text-white font-medium">Terminé</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CassFileProcessor