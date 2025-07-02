import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, User, MapPin, Package, FileText, Edit, Truck, Building, Phone, Mail, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface CasePageProps {
  dossier: string
  onBack: () => void
}

interface CaseData {
  [key: string]: any
}

const CasePage: React.FC<CasePageProps> = ({ dossier, onBack }) => {
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load case data from Supabase MASTER table
  useEffect(() => {
    loadCaseData()
  }, [dossier])

  const loadCaseData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading case data for dossier:', dossier)
      
      const { data: caseRecord, error: caseError } = await supabase
        .from('MASTER')
        .select('*')
        .eq('DOSSIER', dossier)
        .single()

      if (caseError) {
        console.error('Error loading case data:', caseError)
        setError(`Erreur lors du chargement du dossier: ${caseError.message}`)
        return
      }

      console.log('Case data loaded:', caseRecord)
      setCaseData(caseRecord)

    } catch (err) {
      console.error('Failed to load case data:', err)
      setError('Erreur de connexion à la base de données')
    } finally {
      setLoading(false)
    }
  }

  const handleAWBEditor = () => {
    // Placeholder for AWB editor navigation
    alert('Éditeur AWB - Fonctionnalité à venir')
  }

  const formatValue = (value: any, key: string) => {
    if (value === null || value === undefined) return '-'
    
    // Handle text date fields (DATE and DATE2) - display as-is since they're text
    if ((key === 'DATE' || key === 'DATE2') && typeof value === 'string') {
      return value // Display the text date as stored in the database
    }
    
    // Format currency
    if (key.toLowerCase().includes('payable') || key.toLowerCase().includes('amount')) {
      if (typeof value === 'number') {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(value)
      }
      if (typeof value === 'string' && value.includes('€')) {
        return value
      }
    }
    
    return value.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du dossier {dossier}...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error ? 'Erreur de chargement' : 'Dossier introuvable'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || `Le dossier ${dossier} n'existe pas ou n'est plus accessible.`}
          </p>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux opérations</span>
          </button>
        </div>
      </div>
    )
  }

  // Extract key fields for display
  const mainFields = {
    DATE: caseData.DATE,
    DATE2: caseData.DATE2,
    CLIENT: caseData.CLIENT,
    DEPART: caseData.DEPART,
    ARRIVEE: caseData.ARRIVEE,
    NETPAYABLE: caseData.NETPAYABLE,
    LTA: caseData.LTA,
    TYPE: caseData.TYPE,
    EXPEDITEUR: caseData.EXPEDITEUR,
    DESTINATAIRE: caseData.DESTINATAIRE,
    POIDS: caseData.POIDS,
    PIECES: caseData.PIECES,
    STATUS: caseData.STATUS
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour aux opérations</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dossier {caseData.DOSSIER}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {caseData.CLIENT} • {formatValue(caseData.DATE, 'DATE')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAWBEditor}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Éditeur AWB</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {mainFields.DATE && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white font-mono">
                          {formatValue(mainFields.DATE, 'DATE')}
                        </p>
                      </div>
                    </div>
                  )}

                  {mainFields.DATE2 && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date 2</p>
                        <p className="font-medium text-gray-900 dark:text-white font-mono">
                          {formatValue(mainFields.DATE2, 'DATE2')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {mainFields.CLIENT && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                        <p className="font-medium text-gray-900 dark:text-white">{mainFields.CLIENT}</p>
                      </div>
                    </div>
                  )}

                  {(mainFields.DEPART || mainFields.ARRIVEE) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Trajet</p>
                        <p className="font-medium text-gray-900 dark:text-white font-mono">
                          {mainFields.DEPART || '?'} → {mainFields.ARRIVEE || '?'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {mainFields.LTA && (
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">LTA (AWB)</p>
                        <p className="font-medium text-gray-900 dark:text-white font-mono">{mainFields.LTA}</p>
                      </div>
                    </div>
                  )}
                  
                  {mainFields.TYPE && (
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{mainFields.TYPE}</p>
                      </div>
                    </div>
                  )}

                  {mainFields.NETPAYABLE && (
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Net payable</p>
                        <p className="font-medium text-gray-900 dark:text-white text-lg">
                          {formatValue(mainFields.NETPAYABLE, 'NETPAYABLE')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expediteur & Destinataire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expéditeur */}
              {mainFields.EXPEDITEUR && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expéditeur</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{mainFields.EXPEDITEUR}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Destinataire */}
              {mainFields.DESTINATAIRE && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Destinataire</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{mainFields.DESTINATAIRE}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Packaging Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emballage</h3>
              </div>
              <div className="space-y-3">
                {mainFields.POIDS && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Poids</p>
                    <p className="font-medium text-gray-900 dark:text-white">{mainFields.POIDS}</p>
                  </div>
                )}
                {mainFields.PIECES && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nombre de pièces</p>
                    <p className="font-medium text-gray-900 dark:text-white">{mainFields.PIECES}</p>
                  </div>
                )}
                {mainFields.STATUS && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mainFields.STATUS === 'Terminé' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : mainFields.STATUS === 'En cours'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {mainFields.STATUS}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={handleAWBEditor}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Éditeur AWB</span>
                </button>
                
                <button className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Générer rapport</span>
                </button>
                
                <button className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>Notifier client</span>
                </button>
              </div>
            </div>

            {/* All MASTER Table Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Données complètes (MASTER)</h3>
              <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
                {Object.entries(caseData)
                  .filter(([key]) => key !== 'id') // Hide internal ID
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{key}:</span>
                      <span className={`text-gray-900 dark:text-white text-right max-w-xs truncate ${
                        (key === 'DATE' || key === 'DATE2') ? 'font-mono' : ''
                      }`}>
                        {formatValue(value, key)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CasePage