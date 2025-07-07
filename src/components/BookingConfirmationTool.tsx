import React, { useState } from 'react';
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

  const handleFormSubmit = (data: CaseData) => {
    setCurrentData(data);
    setShowForm(false);
  };

  const handleEditForm = () => {
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 print:p-0 print:bg-white">
      {showForm ? (
        <div className="max-w-none">
          <BookingForm onSubmit={handleFormSubmit} initialData={currentData} />
        </div>
      ) : (
        <div className="max-w-none">
          <div className="mb-6 text-center print:hidden">
            <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-2">
              Confirmation de Transport Funéraire
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Document généré - Utilisez Ctrl+P pour imprimer ou sauvegarder en PDF
            </p>
            <div className="space-x-4">
              <button 
                onClick={handleEditForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Modifier les Informations
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Imprimer / Sauvegarder PDF
              </button>
            </div>
          </div>
          <BookingConfirmationTemplate caseData={currentData} />
        </div>
      )}
    </div>
  );
};

export default BookingConfirmationTool;
