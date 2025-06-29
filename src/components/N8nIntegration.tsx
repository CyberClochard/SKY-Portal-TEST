import React, { useState, useEffect } from 'react'
import { Zap, Play, Settings, CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, AlertTriangle, Database, Mail, FileText, Shield, Globe, Webhook, Send, Upload, Download, Users, Calendar, BarChart3 } from 'lucide-react'
import { N8nIntegration, N8nWebhookConfig } from '../lib/n8n'
import { supabase } from '../lib/supabase'

interface WorkflowResult {
  success: boolean
  message: string
  data?: any
  executionId?: string
}

interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  status: 'success' | 'failed' | 'running'
  timestamp: string
  result?: any
  error?: string
}

const N8nIntegrationComponent: React.FC = () => {
  const [n8nConfig, setN8nConfig] = useState({
    baseUrl: localStorage.getItem('n8n_base_url') || 'https://n8n.skylogistics.fr',
    apiKey: localStorage.getItem('n8n_api_key') || ''
  })
  
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  
  // Form states for different workflows
  const [emailForm, setEmailForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'normal'
  })
  
  const [reportForm, setReportForm] = useState({
    reportType: 'monthly',
    startDate: '',
    endDate: '',
    includeCharts: true,
    format: 'pdf'
  })
  
  const [dataProcessForm, setDataProcessForm] = useState({
    operation: 'validate',
    targetTable: 'MASTER',
    batchSize: 100,
    notifyOnComplete: true
  })
  
  const [clientNotificationForm, setClientNotificationForm] = useState({
    clientId: '',
    notificationType: 'status_update',
    message: '',
    sendEmail: true,
    sendSMS: false
  })

  const n8nClient = new N8nIntegration(n8nConfig.baseUrl, n8nConfig.apiKey)

  useEffect(() => {
    if (n8nConfig.baseUrl) {
      checkConnectionStatus()
    }
  }, [n8nConfig.baseUrl])

  const checkConnectionStatus = async () => {
    if (!n8nConfig.baseUrl) {
      setConnectionStatus('disconnected')
      return
    }

    try {
      new URL(n8nConfig.baseUrl)
      const response = await fetch(`${n8nConfig.baseUrl}/healthz`, { 
        method: 'GET',
        timeout: 5000 
      } as any)
      setConnectionStatus(response.ok ? 'connected' : 'disconnected')
    } catch (error) {
      setConnectionStatus('disconnected')
    }
  }

  const saveConfig = () => {
    localStorage.setItem('n8n_base_url', n8nConfig.baseUrl)
    localStorage.setItem('n8n_api_key', n8nConfig.apiKey)
    setSuccess('Configuration n8n sauvegardée')
    setTimeout(() => setSuccess(null), 3000)
    checkConnectionStatus()
  }

  const executeWorkflow = async (workflowId: string, workflowName: string, data: any) => {
    if (!n8nConfig.baseUrl) {
      setError('Configuration n8n requise')
      return null
    }

    setLoading(prev => ({ ...prev, [workflowId]: true }))
    setError(null)

    try {
      const webhookUrl = `${n8nConfig.baseUrl}/webhook/${workflowId}`
      
      const webhookConfig: N8nWebhookConfig = {
        webhookUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (n8nConfig.apiKey) {
        webhookConfig.authentication = {
          type: 'bearer',
          credentials: { token: n8nConfig.apiKey }
        }
      }

      const payload = {
        workflowId,
        timestamp: new Date().toISOString(),
        source: 'SkyLogistics Dashboard',
        ...data
      }

      const result = await n8nClient.sendDataWithRetry(webhookConfig, payload)
      
      // Add to execution history
      const execution: WorkflowExecution = {
        id: Date.now().toString(),
        workflowId,
        workflowName,
        status: 'success',
        timestamp: new Date().toISOString(),
        result
      }
      
      setExecutionHistory(prev => [execution, ...prev.slice(0, 9)])
      setSuccess(`Workflow "${workflowName}" exécuté avec succès`)

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur workflow: ${errorMessage}`)
      
      const execution: WorkflowExecution = {
        id: Date.now().toString(),
        workflowId,
        workflowName,
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: errorMessage
      }
      
      setExecutionHistory(prev => [execution, ...prev.slice(0, 9)])
      return null
    } finally {
      setLoading(prev => ({ ...prev, [workflowId]: false }))
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const updateSupabaseFromWorkflow = async (result: any, operation: string) => {
    if (!result || !result.data) return

    try {
      switch (operation) {
        case 'insert':
          if (result.data.records) {
            const { error } = await supabase
              .from('MASTER')
              .insert(result.data.records)
            
            if (error) throw error
            setSuccess('Données ajoutées à Supabase')
          }
          break
          
        case 'update':
          if (result.data.updates) {
            for (const update of result.data.updates) {
              const { error } = await supabase
                .from('MASTER')
                .update(update.data)
                .eq('DOSSIER', update.dossier)
              
              if (error) throw error
            }
            setSuccess('Données mises à jour dans Supabase')
          }
          break
          
        case 'validate':
          if (result.data.validationResults) {
            // Log validation results or update status fields
            console.log('Validation results:', result.data.validationResults)
            setSuccess('Validation des données terminée')
          }
          break
      }
    } catch (err) {
      setError(`Erreur Supabase: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  // Test flight search workflow
  const testFlightSearch = async () => {
    const result = await executeWorkflow('1f5a8aaf-64cd-49a2-b56c-95d7554a17dc', 'Test Recherche de Vols', {
      destinationCode: 'ALG',
      departureDate: new Date().toISOString().split('T')[0],
      testMode: true
    })

    if (result) {
      setSuccess('Test de recherche de vols effectué avec succès')
    }
  }

  // Workflow handlers
  const handleEmailNotification = async () => {
    if (!emailForm.recipient || !emailForm.subject || !emailForm.message) {
      setError('Tous les champs email sont requis')
      return
    }

    const result = await executeWorkflow('email-notification', 'Notification Email', {
      recipient: emailForm.recipient,
      subject: emailForm.subject,
      message: emailForm.message,
      priority: emailForm.priority,
      sender: 'SkyLogistics'
    })

    if (result) {
      setEmailForm({ recipient: '', subject: '', message: '', priority: 'normal' })
    }
  }

  const handleReportGeneration = async () => {
    if (!reportForm.startDate || !reportForm.endDate) {
      setError('Dates de début et fin requises')
      return
    }

    const result = await executeWorkflow('report-generation', 'Génération de Rapport', {
      reportType: reportForm.reportType,
      startDate: reportForm.startDate,
      endDate: reportForm.endDate,
      includeCharts: reportForm.includeCharts,
      format: reportForm.format,
      requestedBy: 'Admin'
    })

    if (result) {
      // Could trigger download or update UI with report link
      setReportForm({
        reportType: 'monthly',
        startDate: '',
        endDate: '',
        includeCharts: true,
        format: 'pdf'
      })
    }
  }

  const handleDataProcessing = async () => {
    const result = await executeWorkflow('data-processing', 'Traitement des Données', {
      operation: dataProcessForm.operation,
      targetTable: dataProcessForm.targetTable,
      batchSize: dataProcessForm.batchSize,
      notifyOnComplete: dataProcessForm.notifyOnComplete
    })

    if (result) {
      // Update Supabase based on the operation
      await updateSupabaseFromWorkflow(result, dataProcessForm.operation)
    }
  }

  const handleClientNotification = async () => {
    if (!clientNotificationForm.clientId || !clientNotificationForm.message) {
      setError('ID client et message requis')
      return
    }

    const result = await executeWorkflow('client-notification', 'Notification Client', {
      clientId: clientNotificationForm.clientId,
      notificationType: clientNotificationForm.notificationType,
      message: clientNotificationForm.message,
      channels: {
        email: clientNotificationForm.sendEmail,
        sms: clientNotificationForm.sendSMS
      }
    })

    if (result) {
      setClientNotificationForm({
        clientId: '',
        notificationType: 'status_update',
        message: '',
        sendEmail: true,
        sendSMS: false
      })
    }
  }

  const handleDataSync = async () => {
    // Get recent data from Supabase to sync
    try {
      const { data: records, error } = await supabase
        .from('MASTER')
        .select('*')
        .order('DATE', { ascending: false })
        .limit(50)

      if (error) throw error

      const result = await executeWorkflow('data-sync', 'Synchronisation des Données', {
        records: records || [],
        syncType: 'incremental',
        timestamp: new Date().toISOString()
      })

      if (result) {
        await updateSupabaseFromWorkflow(result, 'update')
      }
    } catch (err) {
      setError(`Erreur lors de la récupération des données: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows n8n</h2>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-600 dark:text-gray-400">Automatisation et intégrations</p>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                connectionStatus === 'connected' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span>
                  {connectionStatus === 'connected' ? 'Connecté' : 
                   connectionStatus === 'disconnected' ? 'Déconnecté' : 'Inconnu'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Configuration</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
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

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration n8n</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de base n8n *
              </label>
              <input
                type="url"
                value={n8nConfig.baseUrl}
                onChange={(e) => setN8nConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://n8n.skylogistics.fr"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clé API (optionnel)
              </label>
              <input
                type="password"
                value={n8nConfig.apiKey}
                onChange={(e) => setN8nConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Clé API n8n"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={saveConfig}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Flight Search Test */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Webhook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recherche de Vols Amadeus</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Test du workflow de recherche de vols</p>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-200 font-medium">Webhook configuré (mode production):</p>
              <p className="text-blue-700 dark:text-blue-300 font-mono text-xs break-all">
                https://n8n.skylogistics.fr/webhook/1f5a8aaf-64cd-49a2-b56c-95d7554a17dc
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={testFlightSearch}
          disabled={loading['1f5a8aaf-64cd-49a2-b56c-95d7554a17dc'] || !n8nConfig.baseUrl}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {loading['1f5a8aaf-64cd-49a2-b56c-95d7554a17dc'] ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>Tester Recherche de Vols</span>
        </button>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Email Notification Workflow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Envoyer des emails automatiques</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destinataire
              </label>
              <input
                type="email"
                value={emailForm.recipient}
                onChange={(e) => setEmailForm(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder="email@example.com"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sujet
              </label>
              <input
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Sujet de l'email"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Contenu du message"
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priorité
              </label>
              <select
                value={emailForm.priority}
                onChange={(e) => setEmailForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            
            <button
              onClick={handleEmailNotification}
              disabled={loading['email-notification'] || !n8nConfig.baseUrl}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading['email-notification'] ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Envoyer Email</span>
            </button>
          </div>
        </div>

        {/* Report Generation Workflow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Génération de Rapport</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Créer des rapports automatiques</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de rapport
              </label>
              <select
                value={reportForm.reportType}
                onChange={(e) => setReportForm(prev => ({ ...prev, reportType: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
                <option value="yearly">Annuel</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date début
                </label>
                <input
                  type="date"
                  value={reportForm.startDate}
                  onChange={(e) => setReportForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date fin
                </label>
                <input
                  type="date"
                  value={reportForm.endDate}
                  onChange={(e) => setReportForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={reportForm.includeCharts}
                  onChange={(e) => setReportForm(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Inclure graphiques</span>
              </label>
              
              <div>
                <select
                  value={reportForm.format}
                  onChange={(e) => setReportForm(prev => ({ ...prev, format: e.target.value }))}
                  className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleReportGeneration}
              disabled={loading['report-generation'] || !n8nConfig.baseUrl}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading['report-generation'] ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Générer Rapport</span>
            </button>
          </div>
        </div>

        {/* Data Processing Workflow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Traitement des Données</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valider et traiter les données</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opération
              </label>
              <select
                value={dataProcessForm.operation}
                onChange={(e) => setDataProcessForm(prev => ({ ...prev, operation: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="validate">Valider données</option>
                <option value="clean">Nettoyer données</option>
                <option value="transform">Transformer données</option>
                <option value="backup">Sauvegarder données</option>
                <option value="sync">Synchroniser données</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Table cible
              </label>
              <select
                value={dataProcessForm.targetTable}
                onChange={(e) => setDataProcessForm(prev => ({ ...prev, targetTable: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MASTER">MASTER</option>
                <option value="CLIENTS">CLIENTS</option>
                <option value="OPERATIONS">OPERATIONS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taille du lot
              </label>
              <input
                type="number"
                value={dataProcessForm.batchSize}
                onChange={(e) => setDataProcessForm(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 100 }))}
                min="10"
                max="1000"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dataProcessForm.notifyOnComplete}
                onChange={(e) => setDataProcessForm(prev => ({ ...prev, notifyOnComplete: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Notifier à la fin</span>
            </label>
            
            <button
              onClick={handleDataProcessing}
              disabled={loading['data-processing'] || !n8nConfig.baseUrl}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading['data-processing'] ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Traiter Données</span>
            </button>
          </div>
        </div>

        {/* Client Notification Workflow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Client</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notifier les clients automatiquement</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Client
              </label>
              <input
                type="text"
                value={clientNotificationForm.clientId}
                onChange={(e) => setClientNotificationForm(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="ID ou nom du client"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de notification
              </label>
              <select
                value={clientNotificationForm.notificationType}
                onChange={(e) => setClientNotificationForm(prev => ({ ...prev, notificationType: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="status_update">Mise à jour statut</option>
                <option value="delivery_notification">Notification livraison</option>
                <option value="invoice_ready">Facture prête</option>
                <option value="delay_alert">Alerte retard</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={clientNotificationForm.message}
                onChange={(e) => setClientNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Message à envoyer au client"
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={clientNotificationForm.sendEmail}
                  onChange={(e) => setClientNotificationForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={clientNotificationForm.sendSMS}
                  onChange={(e) => setClientNotificationForm(prev => ({ ...prev, sendSMS: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
              </label>
            </div>
            
            <button
              onClick={handleClientNotification}
              disabled={loading['client-notification'] || !n8nConfig.baseUrl}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading['client-notification'] ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Notifier Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleDataSync}
            disabled={loading['data-sync'] || !n8nConfig.baseUrl}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors disabled:opacity-50 border border-blue-200 dark:border-blue-700"
          >
            {loading['data-sync'] ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Database className="w-5 h-5" />
            )}
            <span>Sync Supabase</span>
          </button>
          
          <button
            onClick={checkConnectionStatus}
            disabled={loading['connection-test']}
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg transition-colors disabled:opacity-50 border border-green-200 dark:border-green-700"
          >
            <Globe className="w-5 h-5" />
            <span>Test Connexion</span>
          </button>
          
          <button
            disabled={!n8nConfig.baseUrl}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-colors disabled:opacity-50 border border-purple-200 dark:border-purple-700"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>

          <button
            disabled={!n8nConfig.baseUrl}
            className="flex items-center justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 border border-gray-200 dark:border-gray-700"
          >
            <Calendar className="w-5 h-5" />
            <span>Planifier</span>
          </button>
        </div>
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historique des exécutions</h3>
          <div className="space-y-3">
            {executionHistory.map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  {execution.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : execution.status === 'failed' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{execution.workflowName}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(execution.timestamp).toLocaleString('fr-FR')}
                    </p>
                    {execution.error && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">{execution.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    execution.status === 'success' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {execution.status === 'success' ? 'Succès' : 'Échec'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Configuration des workflows n8n</h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• <strong>Webhooks requis :</strong> Créez des webhooks dans n8n avec ces IDs :</p>
          <div className="ml-4 space-y-1 font-mono text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <p>- /webhook/1f5a8aaf-64cd-49a2-b56c-95d7554a17dc (Recherche de vols)</p>
            <p>- /webhook/email-notification</p>
            <p>- /webhook/report-generation</p>
            <p>- /webhook/data-processing</p>
            <p>- /webhook/client-notification</p>
            <p>- /webhook/data-sync</p>
          </div>
          <p>• <strong>Données reçues :</strong> Chaque workflow recevra les données du formulaire plus workflowId, timestamp et source</p>
          <p>• <strong>Réponse attendue :</strong> Les workflows peuvent retourner des données pour mettre à jour Supabase</p>
        </div>
      </div>
    </div>
  )
}

export default N8nIntegrationComponent