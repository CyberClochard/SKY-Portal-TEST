import React, { useState, useEffect } from 'react'
import { Zap, Play, Settings, CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, AlertTriangle, Database, Mail, FileText, Shield, Globe, Webhook } from 'lucide-react'
import { N8nIntegration, N8nWebhookConfig, N8nWorkflowTrigger, N8N_WORKFLOWS, n8nHelpers } from '../lib/n8n'

interface N8nIntegrationProps {
  onWorkflowTrigger?: (workflowId: string, result: any) => void
}

const N8nIntegrationComponent: React.FC<N8nIntegrationProps> = ({ onWorkflowTrigger }) => {
  const [n8nConfig, setN8nConfig] = useState({
    baseUrl: localStorage.getItem('n8n_base_url') || '',
    apiKey: localStorage.getItem('n8n_api_key') || '',
    webhookUrl: localStorage.getItem('n8n_webhook_url') || ''
  })
  
  const [workflows, setWorkflows] = useState<N8nWorkflowTrigger[]>([])
  const [executionHistory, setExecutionHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  
  const n8nClient = new N8nIntegration(n8nConfig.baseUrl, n8nConfig.apiKey)

  useEffect(() => {
    // Initialize with predefined workflows
    const predefinedWorkflows: N8nWorkflowTrigger[] = Object.values(N8N_WORKFLOWS).map(workflow => ({
      ...workflow,
      webhookUrl: n8nHelpers.createWebhookUrl(n8nConfig.baseUrl, workflow.id)
    }))
    setWorkflows(predefinedWorkflows)
    
    // Check connection status on load
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
      // Validate the base URL before making the request
      new URL(n8nConfig.baseUrl)
      
      const response = await fetch(`${n8nConfig.baseUrl}/healthz`, { 
        method: 'GET',
        timeout: 5000 
      } as any)
      setConnectionStatus(response.ok ? 'connected' : 'disconnected')
    } catch (error) {
      console.warn('Connection check failed:', error)
      setConnectionStatus('disconnected')
    }
  }

  const saveConfig = () => {
    localStorage.setItem('n8n_base_url', n8nConfig.baseUrl)
    localStorage.setItem('n8n_api_key', n8nConfig.apiKey)
    localStorage.setItem('n8n_webhook_url', n8nConfig.webhookUrl)
    setSuccess('Configuration n8n sauvegardée')
    setTimeout(() => setSuccess(null), 3000)
    checkConnectionStatus()
  }

  const testConnection = async () => {
    if (!n8nConfig.baseUrl) {
      setError('URL de base n8n requise')
      return
    }

    // Validate the base URL before proceeding
    try {
      new URL(n8nConfig.baseUrl)
    } catch (error) {
      setError('URL de base n8n invalide. Veuillez vérifier le format (ex: https://n8n.example.com)')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Test with a simple webhook call
      const testConfig: N8nWebhookConfig = {
        webhookUrl: `${n8nConfig.baseUrl}/webhook/test`,
        method: 'POST'
      }

      await n8nClient.triggerWorkflow(testConfig, { 
        test: true, 
        timestamp: new Date().toISOString(),
        source: 'SkyLogistics Test'
      })
      setSuccess('Connexion n8n réussie!')
      setConnectionStatus('connected')
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
      setConnectionStatus('disconnected')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const triggerWorkflow = async (workflow: N8nWorkflowTrigger, data?: any) => {
    // Check if webhook URL is available
    if (!workflow.webhookUrl || workflow.webhookUrl === '') {
      setError('URL de webhook non configurée. Veuillez configurer l\'URL de base n8n.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const webhookConfig: N8nWebhookConfig = {
        webhookUrl: workflow.webhookUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // Add authentication if API key is provided
      if (n8nConfig.apiKey) {
        webhookConfig.authentication = {
          type: 'bearer',
          credentials: { token: n8nConfig.apiKey }
        }
      }

      const payload = {
        workflowId: workflow.id,
        timestamp: new Date().toISOString(),
        source: 'SkyLogistics Dashboard',
        ...data
      }

      const result = await n8nClient.sendDataWithRetry(webhookConfig, payload)
      
      // Add to execution history
      setExecutionHistory(prev => [{
        id: Date.now().toString(),
        workflowId: workflow.id,
        workflowName: workflow.name,
        status: 'success',
        timestamp: new Date().toISOString(),
        result
      }, ...prev.slice(0, 9)]) // Keep last 10 executions

      setSuccess(`Workflow "${workflow.name}" exécuté avec succès`)
      onWorkflowTrigger?.(workflow.id, result)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur workflow: ${errorMessage}`)
      
      // Add to execution history as failed
      setExecutionHistory(prev => [{
        id: Date.now().toString(),
        workflowId: workflow.id,
        workflowName: workflow.name,
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: errorMessage
      }, ...prev.slice(0, 9)])
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const triggerDataSyncWorkflow = async (records: any[] = []) => {
    const workflow = workflows.find(w => w.id === 'data-sync')
    if (!workflow) return

    const formattedData = records.map(record => 
      n8nHelpers.formatDataForN8n(record, workflow.dataMapping)
    )

    await triggerWorkflow(workflow, { records: formattedData })
  }

  const triggerEmailNotification = async (event: string, data: any) => {
    const workflow = workflows.find(w => w.id === 'email-notification')
    if (!workflow) return

    await triggerWorkflow(workflow, { event, data, timestamp: new Date().toISOString() })
  }

  const getWorkflowIcon = (workflowId: string) => {
    switch (workflowId) {
      case 'data-sync': return Database
      case 'email-notification': return Mail
      case 'report-generation': return FileText
      case 'data-validation': return Shield
      default: return Webhook
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with status */}
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
          <button
            onClick={testConnection}
            disabled={loading || !n8nConfig.baseUrl}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            <span>Tester</span>
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
                placeholder="https://your-n8n-instance.com"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                URL de votre instance n8n (ex: https://n8n.votre-domaine.com)
              </p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optionnel: pour l'authentification des webhooks
              </p>
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

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => triggerDataSyncWorkflow([])}
            disabled={loading || !n8nConfig.baseUrl}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors disabled:opacity-50 border border-blue-200 dark:border-blue-700"
          >
            <Database className="w-5 h-5" />
            <span>Sync données</span>
          </button>
          
          <button
            onClick={() => triggerEmailNotification('test', { message: 'Test depuis SkyLogistics' })}
            disabled={loading || !n8nConfig.baseUrl}
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg transition-colors disabled:opacity-50 border border-green-200 dark:border-green-700"
          >
            <Mail className="w-5 h-5" />
            <span>Test email</span>
          </button>
          
          <button
            disabled={loading || !n8nConfig.baseUrl}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-colors disabled:opacity-50 border border-purple-200 dark:border-purple-700"
          >
            <FileText className="w-5 h-5" />
            <span>Générer rapport</span>
          </button>

          <button
            onClick={checkConnectionStatus}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 border border-gray-200 dark:border-gray-700"
          >
            <Globe className="w-5 h-5" />
            <span>Vérifier statut</span>
          </button>
        </div>
      </div>

      {/* Workflows disponibles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workflows disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => {
            const WorkflowIcon = getWorkflowIcon(workflow.id)
            return (
              <div key={workflow.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <WorkflowIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{workflow.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{workflow.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                    workflow.triggerType === 'automatic' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : workflow.triggerType === 'manual'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {workflow.triggerType === 'automatic' ? 'Auto' : workflow.triggerType === 'manual' ? 'Manuel' : 'Programmé'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {workflow.id}
                  </div>
                  <button
                    onClick={() => triggerWorkflow(workflow)}
                    disabled={loading || !n8nConfig.baseUrl || !workflow.webhookUrl}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-xs transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Exécuter</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Historique des exécutions */}
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
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Guide d'utilisation</h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• <strong>Configuration :</strong> Ajoutez l'URL de votre instance n8n dans la configuration</p>
          <p>• <strong>Webhooks :</strong> Créez des webhooks dans n8n avec les IDs correspondants (data-sync, email-notification, etc.)</p>
          <p>• <strong>Authentification :</strong> Ajoutez une clé API si vos webhooks nécessitent une authentification</p>
          <p>• <strong>Test :</strong> Utilisez le bouton "Tester" pour vérifier la connectivité</p>
        </div>
      </div>
    </div>
  )
}

export default N8nIntegrationComponent