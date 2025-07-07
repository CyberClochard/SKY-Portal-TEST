import React, { useState, useRef } from 'react';
import BookingConfirmationTemplate from './BookingConfirmationTemplate';
import BookingForm from './BookingForm';
import { CaseData } from '../types/booking';

// Sample data for demonstration
const sampleBooking: CaseData = {
  dossierNumber: 'DOS-2024-123456',
  awbNumber: 'AWB-987654321',
  clientName: 'Pompes Funèbres Martin',
  clientContact: {
    email: 'contact@pf-martin.fr',
    phone: '+33 1 23 45 67 89'
  },
  bookingReference: 'REF-2024-001',
  bookingDate: '2024-01-15',
  flights: [{
    flightNumber: 'AF1234',
    airline: 'Air France',
    departure: {
      airport: 'Charles de Gaulle',
      airportCode: 'CDG',
      date: '2024-01-20',
      time: '14:30'
    },
    arrival: {
      airport: 'John F. Kennedy',
      airportCode: 'JFK',
      date: '2024-01-20',
      time: '17:45'
    },
    aircraft: 'Boeing 777-300ER',
    duration: '8h 15m'
  }],
  deceased: {
    id: '1',
    name: 'Jean Dupont',
    type: 'HUM',
    ticketNumber: 'TKT-789123',
    specialRequirements: 'Transport réfrigéré requis'
  },
  deliveryInfo: {
    date: '2024-01-21',
    time: '10:00',
    location: 'Funérarium Central, 123 Rue de la Paix, Paris'
  },
  specialInstructions: 'Manipulation avec précaution. Coordonner avec l\'équipe de réception.',
  emergencyContact: {
    name: 'Marie Dupont',
    phone: '+33 6 12 34 56 78'
  },
  createdAt: '2024-01-15T10:30:00Z',
  status: 'confirmed'
};

const BookingConfirmationTool: React.FC = () => {
  const [currentData, setCurrentData] = useState<CaseData>(sampleBooking);
  const [showForm, setShowForm] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = (data: CaseData) => {
    setCurrentData(data);
    setShowForm(false);
  };

  const handleEditForm = () => {
    setShowForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handlePrint = () => {
    const flight = currentData.flights[0];
    
    // Créer le contenu HTML complet
    const printContent = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Confirmation de Transport Funéraire - ${currentData.deceased.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.4;
              color: #1f2937;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .document-container {
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              background: white;
              display: flex;
              flex-direction: column;
              position: relative;
              overflow: hidden;
            }
            
            .header {
              background: #0f172a;
              color: white;
              padding: 1.5rem;
              text-align: center;
              padding-top: 4rem;
              position: relative;
            }
            
            .header h1 {
              font-size: 1.25rem;
              font-weight: 300;
              letter-spacing: 0.05em;
              margin-bottom: 0.25rem;
            }
            
            .header p {
              color: #cbd5e1;
              font-size: 0.875rem;
            }
            
            .header-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 3rem;
              height: 3rem;
              background: rgba(255,255,255,0.1);
              border-radius: 50%;
              margin-bottom: 0.75rem;
              font-size: 1.5rem;
            }
            
            .logo-top-left {
              position: absolute;
              top: 1rem;
              left: 1rem;
              z-index: 10;
              text-align: center;
            }
            
            .logo-top-right {
              position: absolute;
              top: 1rem;
              right: 1rem;
              z-index: 10;
            }
            
            .company-logo {
              width: 3rem;
              height: 3rem;
              background: #0f172a;
              border-radius: 0.5rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 1.5rem;
              margin-bottom: 0.25rem;
            }
            
            .company-name {
              font-size: 0.75rem;
              font-weight: 600;
              color: #0f172a;
            }
            
            .iata-logo {
              width: 3rem;
              height: 2rem;
              background: #2563eb;
              border-radius: 0.25rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 0.75rem;
            }
            
            .main-content {
              flex: 1;
              padding: 2rem;
              display: flex;
              flex-direction: column;
              gap: 1.5rem;
            }
            
            .info-card {
              border-radius: 0.5rem;
              padding: 1rem;
              border: 1px solid;
            }
            
            .info-card.deceased {
              background: #f8fafc;
              border-color: #e2e8f0;
            }
            
            .info-card.transport {
              background: #eff6ff;
              border-color: #dbeafe;
            }
            
            .info-card.flight {
              background: #f0fdf4;
              border-color: #dcfce7;
            }
            
            .card-header {
              display: flex;
              align-items: center;
              margin-bottom: 0.75rem;
              font-size: 0.875rem;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
            }
            
            .card-header-icon {
              margin-right: 0.5rem;
              font-size: 1rem;
            }
            
            .card-title {
              font-size: 1.25rem;
              font-weight: 300;
              color: #0f172a;
              margin-bottom: 1rem;
            }
            
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
            }
            
            .field-label {
              font-size: 0.875rem;
              color: #64748b;
              margin-bottom: 0.25rem;
            }
            
            .field-value {
              font-size: 1.125rem;
              font-weight: 300;
              color: #0f172a;
            }
            
            .route-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
              margin-top: 1rem;
            }
            
            .route-point {
              display: flex;
              align-items: center;
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
            }
            
            .route-dot {
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              margin-right: 0.5rem;
            }
            
            .route-dot.departure {
              background: #10b981;
            }
            
            .route-dot.arrival {
              background: #ef4444;
            }
            
            .airport-info {
              font-size: 1rem;
              font-weight: 500;
              color: #0f172a;
              margin-bottom: 0.25rem;
            }
            
            .datetime-info {
              font-size: 0.875rem;
              color: #64748b;
              margin-bottom: 0.125rem;
            }
            
            .footer {
              background: #f8fafc;
              padding: 1rem;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              position: relative;
              margin-top: auto;
            }
            
            .footer h3 {
              font-weight: 600;
              color: #0f172a;
              font-size: 0.875rem;
              margin-bottom: 0.25rem;
            }
            
            .footer p {
              font-size: 0.75rem;
              color: #64748b;
              line-height: 1.4;
            }
            
            .footer-iata {
              position: absolute;
              bottom: 1rem;
              right: 1rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .footer-iata-logo {
              width: 1.5rem;
              height: 1rem;
              background: #2563eb;
              border-radius: 0.125rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 0.625rem;
            }
            
            .footer-iata-number {
              font-size: 0.75rem;
              font-family: 'Courier New', monospace;
              color: #64748b;
            }
            
            @media print {
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .document-container { 
                box-shadow: none;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div class="logo-top-left">
              <div class="company-logo">✈</div>
              <div class="company-name">SkyMasters</div>
            </div>
            
            <div class="logo-top-right">
              <div class="iata-logo">IATA</div>
            </div>
            
            <div class="header">
              <div class="header-icon">✈</div>
              <h1>Transport Funéraire</h1>
              <p>Confirmation de Vol</p>
            </div>
            
            <div class="main-content">
              <div class="info-card deceased">
                <div class="card-header">
                  <span class="card-header-icon">👤</span>
                  Nom du Défunt
                </div>
                <div class="card-title">${currentData.deceased.name}</div>
              </div>
              
              <div class="info-card transport">
                <div class="card-header">
                  <span class="card-header-icon">📄</span>
                  Transport
                </div>
                <div class="grid-2">
                  <div>
                    <div class="field-label">N° de LTA</div>
                    <div class="field-value">${currentData.awbNumber}</div>
                  </div>
                  <div>
                    <div class="field-label">Compagnie Aérienne</div>
                    <div class="field-value">${flight.airline}</div>
                  </div>
                </div>
              </div>
              
              <div class="info-card flight">
                <div class="card-header">
                  <span class="card-header-icon">✈</span>
                  Vol & Itinéraire
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                  <div class="field-label">N° de Vol</div>
                  <div class="card-title">${flight.flightNumber}</div>
                </div>
                
                <div class="route-section">
                  <div>
                    <div class="route-point">
                      <div class="route-dot departure"></div>
                      Départ
                    </div>
                    <div class="airport-info">
                      ${flight.departure.airportCode} | ${flight.departure.airport}
                    </div>
                    <div class="datetime-info">
                      📅 ${formatDate(flight.departure.date)}
                    </div>
                    <div class="datetime-info">
                      🕐 ${formatTime(flight.departure.time)}
                    </div>
                  </div>
                  
                  <div>
                    <div class="route-point">
                      <div class="route-dot arrival"></div>
                      Arrivée
                    </div>
                    <div class="airport-info">
                      ${flight.arrival.airportCode} | ${flight.arrival.airport}
                    </div>
                    <div class="datetime-info">
                      📅 ${formatDate(flight.arrival.date)}
                    </div>
                    <div class="datetime-info">
                      🕐 ${formatTime(flight.arrival.time)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <div>
                <h3>SkyMasters Solutions</h3>
                <p>
                  Bâtiment 125-D, rue du Thé<br>
                  Zone Juliette<br>
                  94310 Orly Aérogares
                </p>
              </div>
              
              <div class="footer-iata">
                <div class="footer-iata-logo">IATA</div>
                <span class="footer-iata-number">204 7065 921-5</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      // Écrire le contenu dans la nouvelle fenêtre
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé
      printWindow.onload = () => {
        // Petit délai pour s'assurer que tout est rendu
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // La fenêtre reste ouverte après impression
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
      // Fallback : utiliser l'impression directe de la page actuelle
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 print:p-0 print:bg-white">
      {showForm ? (
        <div className="max-w-6xl mx-auto">
          <BookingForm onSubmit={handleFormSubmit} initialData={currentData} />
        </div>
      ) : (
        <div className="max-w-none">
          <div className="mb-6 text-center print:hidden">
            <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-2">
              Confirmation de Transport Funéraire
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Document généré - Utilisez le bouton d'impression pour sauvegarder en PDF
            </p>
            <div className="space-x-4">
              <button 
                onClick={handleEditForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Modifier les Informations
              </button>
              <button 
                onClick={handlePrint}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Imprimer / Sauvegarder PDF
              </button>
            </div>
          </div>
          <div ref={printRef}>
            <BookingConfirmationTemplate caseData={currentData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmationTool;