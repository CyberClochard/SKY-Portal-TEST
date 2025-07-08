import React, { useState, useRef } from 'react';
import { Download, Printer, Edit, FileText, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import BookingForm from './BookingForm';
import { CaseData } from '../types/booking';

const BookingConfirmationTool: React.FC = () => {
  const [currentData, setCurrentData] = useState<CaseData | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  const handleFormSubmit = async (data: CaseData) => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    setHtmlContent(null)
    setDocumentUrl(null)

    try {
      // Préparer les données pour le webhook n8n avec le nouveau format
      const hasConnection = data.flights.length > 1
      
      const webhookData = {
        // Basic info
        deceasedName: data.deceased.name,
        ltaNumber: data.awbNumber,
        connectionFlight: hasConnection,
        
        // Airlines
        airline1: data.flights[0]?.airline || '',
        ...(hasConnection ? {
          airline2: data.flights[1]?.airline || '',
        } : {}),
        
        // Flight 1 (replaces original single flight variables)
        flightNumber1: data.flights[0]?.flightNumber || '',
        departureAirport1: data.flights[0]?.departure.airport || '',
        departureAirportCode1: data.flights[0]?.departure.airportCode || '',
        departureDate1: data.flights[0]?.departure.date || '',
        departureTime1: data.flights[0]?.departure.time || '',
        
        ...(hasConnection ? {
          // Connection Airport
          connectionAirport: data.flights[0]?.arrival.airport || '',
          connectionAirportCode: data.flights[0]?.arrival.airportCode || '',
          connectionDate1: data.flights[0]?.arrival.date || '',
          connectionTime1: data.flights[0]?.arrival.time || '',
          connectionDate2: data.flights[1]?.departure.date || '',
          connectionTime2: data.flights[1]?.departure.time || '',
          
          // Flight 2
          flightNumber2: data.flights[1]?.flightNumber || '',
          arrivalAirport2: data.flights[1]?.arrival.airport || '',
          arrivalAirportCode2: data.flights[1]?.arrival.airportCode || '',
          arrivalDate2: data.flights[1]?.arrival.date || '',
          arrivalTime2: data.flights[1]?.arrival.time || '',
        } : {
          // Direct flight - final destination is flight 1 arrival (no connection variables)
          arrivalAirport2: data.flights[0]?.arrival.airport || '',
          arrivalAirportCode2: data.flights[0]?.arrival.airportCode || '',
          arrivalDate2: data.flights[0]?.arrival.date || '',
          arrivalTime2: data.flights[0]?.arrival.time || '',
        }),
        
        // Metadata
        timestamp: new Date().toISOString(),
        source: 'SkyLogistics Dashboard'
      }

      console.log('Envoi des données au webhook n8n:', webhookData);

      // Envoyer la requête au webhook n8n
      const response = await fetch('https://n8n.skylogistics.fr/webhook-test/1af37111-e368-4545-a1e5-b07066c5dcaa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      console.log('Réponse du webhook:', response.status, response.statusText);
      console.log('Headers de réponse:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`Erreur webhook: ${response.status} ${response.statusText}`);
      }

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type') || '';
      console.log('Type de contenu de la réponse:', contentType);

      // Traiter comme HTML ou JSON
      if (contentType.includes('text/html')) {
        // Réponse HTML directe
        console.log('Réception d\'un HTML direct')
        const htmlText = await response.text()
        console.log('Taille du HTML:', htmlText.length, 'caractères')
        
        if (htmlText.length > 0) {
          setHtmlContent(htmlText)
          setCurrentData(data)
          setShowForm(false)
          setSuccess('Document HTML généré avec succès')
        } else {
          throw new Error('Le HTML reçu est vide')
        }
      } else if (contentType.includes('application/json')) {
        // Réponse JSON
        const responseText = await response.text();
        console.log('Réponse JSON brute:', responseText);
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Erreur de parsing JSON:', parseError);
          throw new Error('Réponse JSON invalide du webhook');
        }
        
        console.log('Résultat JSON du webhook:', result);
        
        if (result.html) {
          // HTML dans la réponse JSON
          console.log('HTML reçu dans JSON')
          setHtmlContent(result.html)
          setCurrentData(data)
          setShowForm(false)
          setSuccess('Document HTML généré avec succès')
        } else if (result.htmlUrl) {
          console.log('URL HTML reçue:', result.htmlUrl)
          
          // Vérifier si l'URL HTML est accessible
          try {
            const htmlResponse = await fetch(result.htmlUrl)
            if (htmlResponse.ok) {
              const htmlText = await htmlResponse.text()
              setHtmlContent(htmlText)
              setCurrentData(data);
              setShowForm(false);
              setSuccess('Document HTML généré avec succès')
            } else {
              throw new Error(`HTML non accessible à l'URL: ${result.htmlUrl}`)
            }
          } catch (urlError) {
            console.error('Erreur d\'accès à l\'URL HTML:', urlError)
            // Fallback: utiliser l'URL directement
            setDocumentUrl(result.htmlUrl)
            setCurrentData(data);
            setShowForm(false);
            setSuccess('Document HTML généré avec succès (URL directe)')
          }
        } else if (result.success !== false) {
          // Succès mais pas de HTML
          console.warn('Succès mais aucun HTML trouvé dans la réponse:', result)
          setCurrentData(data);
          setShowForm(false);
          setError(result.message || 'Document traité avec succès, mais aucun HTML reçu. Vérifiez la configuration du webhook n8n.')
        } else {
          throw new Error(result.message || 'Erreur lors de la génération du document')
        }
      } else {
        // Type de contenu inconnu - essayer de traiter comme HTML
        console.log('Type de contenu inconnu:', contentType, '- tentative de traitement comme HTML')
        const htmlText = await response.text()
        console.log('Contenu reçu:', htmlText.length, 'caractères')
        
        if (htmlText.length > 0) {
          setHtmlContent(htmlText)
          setCurrentData(data);
          setShowForm(false);
          setSuccess('Document HTML généré avec succès (type de contenu détecté automatiquement)')
        } else {
          throw new Error(`Réponse vide du webhook. Type: ${contentType}, Contenu: ${htmlText.substring(0, 100)}`)
        }
      }

    } catch (err) {
      console.error('Erreur lors de la génération du document:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de la génération: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditForm = () => {
    setShowForm(true);
    setError(null);
    setSuccess(null);
    setHtmlContent(null)
    setDocumentUrl(null)
  };

  const handleDownloadHtml = () => {
    if (htmlContent && currentData) {
      // Créer un blob HTML pour le téléchargement
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob)
      link.href = url;
      link.download = `confirmation-transport-${currentData.deceased.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (documentUrl) {
      // Fallback avec l'URL
      const link = document.createElement('a');
      link.href = documentUrl
      link.download = `confirmation-transport-${currentData?.deceased.name.replace(/\s+/g, '-') || 'document'}-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintHtml = () => {
    if (htmlContent) {
      // Créer une nouvelle fenêtre avec le contenu HTML
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
          }, 500)
        }
      }
    } else if (documentUrl) {
      // Ouvrir l'URL dans une nouvelle fenêtre pour impression
      const printWindow = window.open(documentUrl, '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
          }, 500)
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 print:p-0 print:bg-white">
      {showForm ? (
        <div className="max-w-6xl mx-auto">
          <BookingForm 
            onSubmit={handleFormSubmit} 
            initialData={currentData} 
            isSubmitting={isGenerating}
          />
        </div>
      ) : (
        <div className="max-w-none">
          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-6xl mx-auto">
              <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Erreur de génération</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 max-w-6xl mx-auto">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mb-6 print:hidden max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Confirmation de Transport Funéraire
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentData ? `Document pour ${currentData.deceased.name}` : 'Document généré'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleEditForm}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  
                  {(htmlContent || documentUrl) && (
                    <>
                      <button 
                        onClick={handleDownloadHtml}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger</span>
                      </button>
                      
                      <button 
                        onClick={handlePrintHtml}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimer</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HTML Viewer */}
          {htmlContent ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Aperçu du document HTML
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Document prêt</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    className="w-full min-h-[800px] p-6 bg-white"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </div>
              </div>
            </div>
          ) : documentUrl ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Document externe
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Document prêt</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <iframe
                    src={documentUrl}
                    className="w-full h-[800px] border-0"
                    title="Confirmation de Transport Funéraire"
                    onLoad={() => console.log('Document iframe chargé')}
                    onError={() => console.error('Erreur de chargement du document iframe')}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isGenerating ? 'Génération en cours...' : 'Aucun document à afficher'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isGenerating 
                    ? 'Le document HTML est en cours de génération par le workflow n8n.'
                    : 'Le document HTML sera affiché ici une fois généré avec succès.'
                  }
                </p>
                {isGenerating && (
                  <div className="mt-4">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Debug Info (en développement) */}
          {(process.env.NODE_ENV === 'development' || true) && (
            <div className="mt-6 max-w-6xl mx-auto">
              <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                  Informations de débogage
                </summary>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p><strong>HTML Content:</strong> {htmlContent ? `${htmlContent.length} caractères` : 'Aucun'}</p>
                  <p><strong>Document URL:</strong> {documentUrl || 'Aucune'}</p>
                  <p><strong>Données actuelles:</strong> {currentData ? 'Présentes' : 'Aucunes'}</p>
                  <p><strong>État génération:</strong> {isGenerating ? 'En cours' : 'Terminé'}</p>
                  <p><strong>Erreur:</strong> {error || 'Aucune'}</p>
                  <p><strong>Succès:</strong> {success || 'Aucun'}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingConfirmationTool;