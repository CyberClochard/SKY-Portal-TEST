import React, { useState } from 'react'
import { Plane, Search, Clock, MapPin, Calendar, AlertCircle, CheckCircle, RefreshCw, Filter, Download, Settings } from 'lucide-react'

interface FlightResult {
  'Flight Number': string
  'Departure Time': string
  'Arrival Time': string
}

interface FlightSearchProps {
  n8nBaseUrl?: string
}

const FlightSearch: React.FC<FlightSearchProps> = ({ n8nBaseUrl }) => {
  const [searchForm, setSearchForm] = useState({
    destinationCode: '',
    departureDate: '',
  })
  
  const [results, setResults] = useState<FlightResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastSearchTime, setLastSearchTime] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Get n8n configuration from localStorage (same as CASS processor)
  const getN8nConfig = () => {
    const baseUrl = localStorage.getItem('n8n_base_url') || 'https://n8n.skylogistics.fr'
    return baseUrl
  }

  // Common airport codes for quick selection
  const popularDestinations = [
    { code: 'ALG', name: 'Alger', country: 'Algérie' },
    { code: 'ORN', name: 'Oran', country: 'Algérie' },
    { code: 'CZL', name: 'Constantine', country: 'Algérie' },
    { code: 'AAE', name: 'Annaba', country: 'Algérie' },
    { code: 'TLM', name: 'Tlemcen', country: 'Algérie' },
    { code: 'BJA', name: 'Béjaïa', country: 'Algérie' },
    { code: 'GHB', name: 'Ghardaïa', country: 'Algérie' },
    { code: 'TMR', name: 'Tamanrasset', country: 'Algérie' },
  ]

  // Check if form is valid
  const isFormValid = searchForm.destinationCode.trim().length === 3 && searchForm.departureDate.trim() !== ''

  // Get current n8n configuration
  const currentN8nBaseUrl = getN8nConfig()
  const isN8nConfigured = currentN8nBaseUrl && currentN8nBaseUrl.trim() !== ''

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString)
      return {
        date: date.toLocaleDateString('fr-FR'),
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
    } catch {
      return { date: 'N/A', time: 'N/A' }
    }
  }

  const calculateDuration = (departure: string, arrival: string) => {
    try {
      const dep = new Date(departure)
      const arr = new Date(arrival)
      const diffMs = arr.getTime() - dep.getTime()
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    } catch {
      return 'N/A'
    }
  }

  const searchFlights = async () => {
    if (!isFormValid) {
      setError('Veuillez remplir tous les champs requis')
      return
    }

    if (!isN8nConfigured) {
      setError('Configuration n8n requise pour effectuer la recherche. Veuillez configurer n8n dans la section Workflows.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setDebugInfo(null)

    try {
      const webhookUrl = `${currentN8nBaseUrl}/webhook/1f5a8aaf-64cd-49a2-b56c-95d7554a17dc`
      
      console.log('Sending request to:', webhookUrl)
      console.log('Request data:', {
        destinationCode: searchForm.destinationCode.toUpperCase(),
        departureDate: searchForm.departureDate,
      })

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'destinationlocationcode': searchForm.destinationCode.toUpperCase(),
          'date': searchForm.departureDate,
        },
        body: JSON.stringify({
          destinationCode: searchForm.destinationCode.toUpperCase(),
          departureDate: searchForm.departureDate,
          source: 'SkyLogistics Dashboard',
          timestamp: new Date().toISOString()
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
      }

      // Get response text first to debug
      const responseText = await response.text()
      console.log('Raw response:', responseText)

      // Store debug info
      setDebugInfo({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: responseText,
        url: webhookUrl
      })

      // Try to parse JSON
      let data
      if (responseText.trim() === '') {
        // Empty response - show no flights found
        setResults([])
        setSuccess('Aucun vol trouvé pour cette recherche')
        setLastSearchTime(new Date().toLocaleString('fr-FR'))
        return
      }

      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        setError(`Réponse JSON invalide du workflow n8n. Réponse reçue: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`)
        setResults([])
        return
      }

      console.log('Parsed data:', data)
      
      // Handle different response formats
      let flights: FlightResult[] = []
      
      if (Array.isArray(data)) {
        flights = data
      } else if (data && Array.isArray(data.flights)) {
        flights = data.flights
      } else if (data && Array.isArray(data.data)) {
        flights = data.data
      } else if (data && data.message) {
        // Workflow returned a message (possibly an error)
        setError(`Message du workflow: ${data.message}`)
        setResults([])
        return
      } else {
        // Unknown format
        setError(`Format de réponse inattendu du workflow. Données reçues: ${JSON.stringify(data).substring(0, 200)}`)
        setResults([])
        return
      }

      // Validate flight data structure
      const validFlights = flights.filter(flight => 
        flight && 
        typeof flight === 'object' && 
        flight['Flight Number'] && 
        flight['Departure Time'] && 
        flight['Arrival Time']
      )

      if (validFlights.length > 0) {
        setResults(validFlights)
        setSuccess(`${validFlights.length} vol(s) trouvé(s)`)
        setLastSearchTime(new Date().toLocaleString('fr-FR'))
      } else if (flights.length > 0) {
        setError(`Données de vol invalides reçues. Format attendu: {Flight Number, Departure Time, Arrival Time}`)
        setResults([])
      } else {
        // No flights found - this is the key change
        setResults([])
        setSuccess('Aucun vol trouvé pour cette recherche')
        setLastSearchTime(new Date().toLocaleString('fr-FR'))
      }

    } catch (err) {
      console.error('Search error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur lors de la recherche: ${errorMessage}`)
      setResults([])
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  const exportResults = () => {
    if (results.length === 0) return

    const csvContent = [
      ['Numéro de Vol', 'Heure de Départ', 'Heure d\'Arrivée', 'Durée'].join(','),
      ...results.map(flight => [
        flight['Flight Number'],
        flight['Departure Time'],
        flight['Arrival Time'],
        calculateDuration(flight['Departure Time'], flight['Arrival Time'])
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `vols_${searchForm.destinationCode}_${searchForm.departureDate}.csv`)
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
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recherche de Vols</h2>
            <p className="text-gray-600 dark:text-gray-400">Trouvez les vols Air Algérie depuis Paris Orly</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {lastSearchTime && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Dernière recherche</p>
              <p className="text-gray-900 dark:text-white font-medium">{lastSearchTime}</p>
            </div>
          )}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isN8nConfigured 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isN8nConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isN8nConfigured ? 'n8n configuré' : 'Configuration requise'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erreur de recherche</p>
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
            <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Webhook de recherche de vols</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                {currentN8nBaseUrl}/webhook/1f5a8aaf-64cd-49a2-b56c-95d7554a17dc
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Recherche de vols Air Algérie via API Amadeus
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
              <p className="text-sm mt-1">Veuillez configurer l'URL de base n8n dans la section "Workflows n8n" pour effectuer des recherches de vols.</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (only show when there's an error and debug data) */}
      {debugInfo && error && (
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

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres de recherche</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Origin (Fixed) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Départ
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400">
              ORY - Paris Orly
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination *
            </label>
            <input
              type="text"
              value={searchForm.destinationCode}
              onChange={(e) => setSearchForm(prev => ({ ...prev, destinationCode: e.target.value.toUpperCase() }))}
              placeholder="ALG, ORN, CZL..."
              maxLength={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de départ *
            </label>
            <input
              type="date"
              value={searchForm.departureDate}
              onChange={(e) => setSearchForm(prev => ({ ...prev, departureDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Destination Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Destinations populaires
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {popularDestinations.map((dest) => (
              <button
                key={dest.code}
                onClick={() => setSearchForm(prev => ({ ...prev, destinationCode: dest.code }))}
                className={`p-2 text-xs rounded-lg border transition-colors ${
                  searchForm.destinationCode === dest.code
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{dest.code}</div>
                <div className="text-xs opacity-75">{dest.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Vols directs Air Algérie • 1 passager adulte</span>
          </div>
          <button
            onClick={searchFlights}
            disabled={loading || !isFormValid || !isN8nConfigured}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Rechercher</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Résultats de recherche ({results.length} vol{results.length > 1 ? 's' : ''})
              </h3>
              <button
                onClick={exportResults}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {results.map((flight, index) => {
                const departure = formatDateTime(flight['Departure Time'])
                const arrival = formatDateTime(flight['Arrival Time'])
                const duration = calculateDuration(flight['Departure Time'], flight['Arrival Time'])

                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Flight Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {flight['Flight Number']}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Air Algérie</p>
                        </div>
                      </div>

                      {/* Departure */}
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{departure.time}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ORY - Paris</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{departure.date}</p>
                      </div>

                      {/* Duration */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{duration}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Direct</p>
                      </div>

                      {/* Arrival */}
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{arrival.time}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{searchForm.destinationCode}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{arrival.date}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && results.length === 0 && lastSearchTime && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <Plane className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun vol trouvé</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucun vol direct Air Algérie n'a été trouvé pour cette destination et cette date.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Essayez une autre date ou vérifiez le code de destination.
          </p>
        </div>
      )}

      {/* Configuration Help */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Configuration du webhook de recherche</h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• <strong>Webhook configuré :</strong></p>
          <div className="ml-4 space-y-1 font-mono text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <p>URL: {isN8nConfigured ? `${currentN8nBaseUrl}/webhook/1f5a8aaf-64cd-49a2-b56c-95d7554a17dc` : 'Configuration requise'}</p>
            <p>Méthode: POST (JSON)</p>
            <p>Headers: destinationlocationcode, date</p>
          </div>
          <p>• <strong>Données envoyées :</strong> destinationCode, departureDate, source, timestamp</p>
          <p>• <strong>Réponse attendue :</strong> Array de vols avec Flight Number, Departure Time, Arrival Time</p>
          {!isN8nConfigured && (
            <p className="text-yellow-700 dark:text-yellow-300">
              ⚠️ <strong>Action requise :</strong> Configurez l'URL n8n dans la section "Workflows n8n"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlightSearch