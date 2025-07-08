import React, { useState, useRef } from 'react';
import BookingForm from './BookingForm';
import { CaseData } from '../types/booking';

const BookingConfirmationTool: React.FC = () => {
  const [currentData, setCurrentData] = useState<CaseData | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFormSubmit = async (data: CaseData) => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    setPdfUrl(null);

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

      if (!response.ok) {
        throw new Error(`Erreur webhook: ${response.status} ${response.statusText}`);
      }

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      console.log('Type de contenu de la réponse:', contentType);

      if (contentType && contentType.includes('application/pdf')) {
        // Réponse PDF directe
        const pdfBlob = await response.blob();
        const pdfObjectUrl = URL.createObjectURL(pdfBlob);
        
        setPdfUrl(pdfObjectUrl);
        setCurrentData(data);
        setShowForm(false);
        setSuccess('Document PDF généré avec succès');
      } else {
        // Réponse JSON avec URL ou données
        const result = await response.json();
        console.log('Résultat JSON du webhook:', result);
        
        if (result.pdfUrl) {
          setPdfUrl(result.pdfUrl);
          setCurrentData(data);
          setShowForm(false);
          setSuccess('Document PDF généré avec succès');
        } else if (result.success !== false) {
          // Succès mais pas de PDF direct
          setCurrentData(data);
          setShowForm(false);
          setSuccess(result.message || 'Document traité avec succès');
        } else {
          throw new Error(result.message || 'Erreur lors de la génération du PDF');
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
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl && currentData) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `confirmation-transport-${currentData.deceased.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintPdf = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
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
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-4xl mx-auto">
              <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Erreur de génération</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mb-6 text-center print:hidden max-w-4xl mx-auto">
            <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-2">
              Confirmation de Transport Funéraire
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Document généré - Utilisez les boutons ci-dessous pour télécharger ou imprimer
            </p>
            <div className="space-x-4">
              <button 
                onClick={handleEditForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Modifier les Informations
              </button>
              {pdfUrl && (
                <>
                  <button 
                    onClick={handleDownloadPdf}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Télécharger PDF
                  </button>
                  <button 
                    onClick={handlePrintPdf}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Imprimer PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PDF Viewer */}
          {pdfUrl ? (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[800px] border-0"
                title="Confirmation de Transport Funéraire"
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Document en cours de génération
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Le PDF sera affiché ici une fois généré par le workflow n8n.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingConfirmationTool;