// n8n Integration Library
export interface N8nWebhookConfig {
  webhookUrl: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  authentication?: {
    type: 'basic' | 'bearer' | 'api-key'
    credentials: Record<string, string>
  }
}

export interface N8nWorkflowTrigger {
  id: string
  name: string
  description: string
  webhookUrl: string
  triggerType: 'manual' | 'automatic' | 'scheduled'
  dataMapping?: Record<string, string>
}

export class N8nIntegration {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = apiKey
  }

  // Trigger a workflow via webhook
  async triggerWorkflow(config: N8nWebhookConfig, data?: any): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
      }

      // Add authentication headers
      if (config.authentication) {
        switch (config.authentication.type) {
          case 'bearer':
            headers['Authorization'] = `Bearer ${config.authentication.credentials.token}`
            break
          case 'basic':
            const basicAuth = btoa(`${config.authentication.credentials.username}:${config.authentication.credentials.password}`)
            headers['Authorization'] = `Basic ${basicAuth}`
            break
          case 'api-key':
            headers[config.authentication.credentials.headerName || 'X-API-Key'] = config.authentication.credentials.apiKey
            break
        }
      }

      const response = await fetch(config.webhookUrl, {
        method: config.method || 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined
      })

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json().catch(() => ({}))
      return result
    } catch (error) {
      console.error('n8n workflow trigger error:', error)
      throw error
    }
  }

  // Get workflow execution status (if n8n API is available)
  async getWorkflowExecutions(workflowId: string, limit = 10): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('API key required for workflow execution queries')
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/executions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch executions: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Failed to get workflow executions:', error)
      throw error
    }
  }

  // Send data to n8n workflow with retry logic
  async sendDataWithRetry(config: N8nWebhookConfig, data: any, maxRetries = 3): Promise<any> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.triggerWorkflow(config, data)
        return result
      } catch (error) {
        lastError = error as Error
        console.warn(`n8n workflow attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }
}

// Predefined workflow configurations for common use cases
export const N8N_WORKFLOWS = {
  // Data synchronization workflow
  DATA_SYNC: {
    id: 'data-sync',
    name: 'Synchronisation des données',
    description: 'Synchronise les données avec des systèmes externes',
    triggerType: 'automatic' as const,
    dataMapping: {
      'DOSSIER': 'fileNumber',
      'CLIENT': 'clientName',
      'DATE': 'date',
      'DEPART': 'departure',
      'ARRIVEE': 'arrival'
    }
  },
  
  // Email notification workflow
  EMAIL_NOTIFICATION: {
    id: 'email-notification',
    name: 'Notifications par email',
    description: 'Envoie des notifications par email pour les événements importants',
    triggerType: 'automatic' as const,
    dataMapping: {
      'event': 'eventType',
      'data': 'eventData',
      'timestamp': 'timestamp'
    }
  },
  
  // Report generation workflow
  REPORT_GENERATION: {
    id: 'report-generation',
    name: 'Génération de rapports',
    description: 'Génère des rapports automatiques',
    triggerType: 'manual' as const,
    dataMapping: {
      'startDate': 'startDate',
      'endDate': 'endDate',
      'reportType': 'reportType'
    }
  },
  
  // Data validation workflow
  DATA_VALIDATION: {
    id: 'data-validation',
    name: 'Validation des données',
    description: 'Valide et nettoie les données importées',
    triggerType: 'automatic' as const,
    dataMapping: {
      'records': 'dataRecords',
      'validationRules': 'rules'
    }
  }
} as const

// Helper functions for common n8n operations
export const n8nHelpers = {
  // Format data for n8n consumption
  formatDataForN8n: (record: any, mapping?: Record<string, string>) => {
    if (!mapping) return record

    const formatted: Record<string, any> = {}
    Object.entries(mapping).forEach(([sourceKey, targetKey]) => {
      if (record[sourceKey] !== undefined) {
        formatted[targetKey] = record[sourceKey]
      }
    })
    return formatted
  },

  // Create webhook URL with parameters
  createWebhookUrl: (baseUrl: string, workflowId: string, params?: Record<string, string>) => {
    // Return empty string if baseUrl is empty or invalid
    if (!baseUrl || baseUrl.trim() === '') {
      return ''
    }

    try {
      const url = new URL(`${baseUrl}/webhook/${workflowId}`)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value)
        })
      }
      return url.toString()
    } catch (error) {
      console.warn('Invalid base URL provided to createWebhookUrl:', baseUrl)
      return ''
    }
  },

  // Validate webhook response
  validateWebhookResponse: (response: any) => {
    return {
      success: response?.success !== false,
      message: response?.message || 'Workflow executed',
      data: response?.data || response,
      executionId: response?.executionId
    }
  }
}