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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFormSubmit = async (data: CaseData) => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    setPdfUrl(null);
    setPdfBlob(null);

    try {
      // Préparer les données pour le webhook n8n
      const webhookData = {
        // Informations du défunt
        deceasedName: data.deceased.name,
        
        // Informations LTA
        ltaNumber: data.awbNumber,
        
        // Informations de vol
        flightNumber: data.flights[0]?.flightNumber || '',
        airline: data.flights[0]?.airline || '',
        
        // Départ
        departureAirport: data.flights[0]?.departure.airport || '',
        departureAirportCode: data.flights[0]?.departure.airportCode || '',
        departureDate: data.flights[0]?.departure.date || '',
        departureTime: data.flights[0]?.departure.time || '',
        
        // Arrivée
        arrivalAirport: data.flights[0]?.arrival.airport || '',
        arrivalAirportCode: data.flights[0]?.arrival.airportCode || '',
        arrivalDate: data.flights[0]?.arrival.date || '',
        arrivalTime: data.flights[0]?.arrival.time || '',
        
        // Métadonnées
        timestamp: new Date().toISOString(),
        source: 'SkyLogistics Dashboard'
      };

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

      if (contentType.includes('application/pdf')) {
        // Réponse PDF directe
        console.log('Réception d\'un PDF direct');
        const blob = await response.blob();
        console.log('Taille du blob PDF:', blob.size, 'bytes');
        
        if (blob.size > 0) {
          const objectUrl = URL.createObjectURL(blob);
          setPdfBlob(blob);
          setPdfUrl(objectUrl);
          setCurrentData(data);
          setShowForm(false);
          setSuccess('Document PDF généré avec succès');
        } else {
          throw new Error('Le PDF reçu est vide');
        }
      } else if (contentType.includes('application/json')) {
        // Réponse JSON
        const result = await response.json();
        console.log('Résultat JSON du webhook:', result);
        
        if (result.pdfUrl) {
          console.log('URL PDF reçue:', result.pdfUrl);
          setPdfUrl(result.pdfUrl);
          setCurrentData(data);
          setShowForm(false);
          setSuccess('Document PDF généré avec succès');
        } else if (result.pdfData) {
          // PDF encodé en base64
          console.log('PDF en base64 reçu');
          const binaryString = atob(result.pdfData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          setPdfBlob(blob);
          setPdfUrl(objectUrl);
          setCurrentData(data);
          setShowForm(false);
          setSuccess('Document PDF généré avec succès');
        } else if (result.success !== false) {
          // Succès mais pas de PDF
          setCurrentData(data);
          setShowForm(false);
          setSuccess(result.message || 'Document traité avec succès, mais aucun PDF reçu');
        } else {
          throw new Error(result.message || 'Erreur lors de la génération du PDF');
        }
      } else {
        // Autre type de contenu - essayer de traiter comme PDF
        console.log('Type de contenu inconnu, tentative de traitement comme PDF');
        const blob = await response.blob();
        if (blob.size > 0) {
          const objectUrl = URL.createObjectURL(blob);
          setPdfBlob(blob);
          setPdfUrl(objectUrl);
          setCurrentData(data);
          setShowForm(false);
          setSuccess('Document généré avec succès');
        } else {
          throw new Error('Réponse vide du webhook');
        }
      }

    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
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
    
    // Nettoyer les URLs d'objet pour éviter les fuites mémoire
    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setPdfBlob(null);
  };

  const handleDownloadPdf = () => {
    if (pdfBlob && currentData) {
      // Utiliser le blob pour le téléchargement
      const link = document.createElement('a');
      const url = URL.createObjectURL(pdfBlob);
      link.href = url;
      link.download = `confirmation-transport-${currentData.deceased.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (pdfUrl) {
      // Fallback avec l'URL
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `confirmation-transport-${currentData?.deceased.name.replace(/\s+/g, '-') || 'document'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintPdf = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        };
        
        // Fallback si onload ne fonctionne pas
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.focus();
            printWindow.print();
          }
        }, 1000);
      } else {
        // Si le popup est bloqué, essayer d'ouvrir dans le même onglet
        window.open(pdfUrl, '_self');
      }
    }
  };

  // Nettoyer les URLs d'objet au démontage du composant
  React.useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

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
                  
                  {pdfUrl && (
                    <>
                      <button 
                        onClick={handleDownloadPdf}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger</span>
                      </button>
                      
                      <button 
                        onClick={handlePrintPdf}
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

          {/* PDF Viewer */}
          {pdfUrl ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Aperçu du document PDF
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Document prêt</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[800px] border-0"
                    title="Confirmation de Transport Funéraire"
                    onLoad={() => console.log('PDF iframe chargé')}
                    onError={() => console.error('Erreur de chargement du PDF iframe')}
                  />
                  
                  {/* Overlay de chargement */}
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300" id="pdf-loading">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Chargement du PDF...</p>
                    </div>
                  </div>
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
                    ? 'Le PDF est en cours de génération par le workflow n8n.'
                    : 'Le PDF sera affiché ici une fois généré avec succès.'
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
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 max-w-6xl mx-auto">
              <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                  Informations de débogage
                </summary>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p><strong>PDF URL:</strong> {pdfUrl || 'Aucune'}</p>
                  <p><strong>PDF Blob:</strong> {pdfBlob ? `${pdfBlob.size} bytes` : 'Aucun'}</p>
                  <p><strong>Données actuelles:</strong> {currentData ? 'Présentes' : 'Aucunes'}</p>
                  <p><strong>État génération:</strong> {isGenerating ? 'En cours' : 'Terminé'}</p>
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