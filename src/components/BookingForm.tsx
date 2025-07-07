import React, { useState } from 'react';
import { User, Plane, FileText, Save, Calendar, MapPin } from 'lucide-react';
import { CaseData } from '../types/booking';

interface BookingFormProps {
  onSubmit: (data: CaseData) => void;
  initialData?: CaseData;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<CaseData>(
    initialData || {
      dossierNumber: '',
      awbNumber: '',
      clientName: '',
      clientContact: {
        email: '',
        phone: ''
      },
      bookingReference: '',
      bookingDate: new Date().toISOString().split('T')[0],
      flights: [{
        flightNumber: '',
        airline: '',
        departure: {
          airport: '',
          airportCode: '',
          date: '',
          time: ''
        },
        arrival: {
          airport: '',
          airportCode: '',
          date: '',
          time: ''
        },
        aircraft: '',
        duration: ''
      }],
      deceased: {
        id: '1',
        name: '',
        type: 'HUM',
        ticketNumber: '',
        specialRequirements: ''
      },
      deliveryInfo: {
        date: '',
        time: '',
        location: ''
      },
      specialInstructions: '',
      emergencyContact: {
        name: '',
        phone: ''
      },
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    }
  );

  const handleFlightChange = (field: string, value: string, section?: string) => {
    setFormData(prev => ({
      ...prev,
      flights: [{
        ...prev.flights[0],
        ...(section ? {
          [section]: {
            ...prev.flights[0][section as keyof typeof prev.flights[0]],
            [field]: value
          }
        } : {
          [field]: value
        })
      }]
    }));
  };

  const handleDeceasedChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      deceased: {
        ...prev.deceased,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirmation de Transport Funéraire</h2>
          <p className="text-gray-600 dark:text-gray-400">Remplissez les informations pour générer le document</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du défunt */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations du défunt</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du défunt *
              </label>
              <input
                type="text"
                required
                value={formData.deceased.name}
                onChange={(e) => handleDeceasedChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                N° de LTA *
              </label>
              <input
                type="text"
                required
                value={formData.awbNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, awbNumber: e.target.value }))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors font-mono"
                placeholder="AWB-987654321"
              />
            </div>
          </div>
        </div>

        {/* Informations de vol */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de vol</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                N° de vol *
              </label>
              <input
                type="text"
                required
                value={formData.flights[0].flightNumber}
                onChange={(e) => handleFlightChange('flightNumber', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                placeholder="AF1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compagnie aérienne *
              </label>
              <input
                type="text"
                required
                value={formData.flights[0].airline}
                onChange={(e) => handleFlightChange('airline', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Air France"
              />
            </div>
          </div>

          {/* Itinéraire */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Départ */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-medium text-gray-900 dark:text-white">Départ</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.flights[0].departure.airportCode}
                    onChange={(e) => handleFlightChange('airportCode', e.target.value.toUpperCase(), 'departure')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono text-center"
                    placeholder="CDG"
                    maxLength={3}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aéroport *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.flights[0].departure.airport}
                    onChange={(e) => handleFlightChange('airport', e.target.value, 'departure')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Charles de Gaulle"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.flights[0].departure.date}
                    onChange={(e) => handleFlightChange('date', e.target.value, 'departure')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.flights[0].departure.time}
                    onChange={(e) => handleFlightChange('time', e.target.value, 'departure')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Arrivée */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h4 className="font-medium text-gray-900 dark:text-white">Arrivée</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.flights[0].arrival.airportCode}
                    onChange={(e) => handleFlightChange('airportCode', e.target.value.toUpperCase(), 'arrival')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors font-mono text-center"
                    placeholder="JFK"
                    maxLength={3}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aéroport *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.flights[0].arrival.airport}
                    onChange={(e) => handleFlightChange('airport', e.target.value, 'arrival')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="John F. Kennedy"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.flights[0].arrival.date}
                    onChange={(e) => handleFlightChange('date', e.target.value, 'arrival')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.flights[0].arrival.time}
                    onChange={(e) => handleFlightChange('time', e.target.value, 'arrival')}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="flex items-center space-x-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
          >
            <Save className="w-5 h-5" />
            <span>Générer le document</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;