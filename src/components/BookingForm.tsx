import React, { useState } from 'react';
import { User, Plane, FileText, Save } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">Informations de Transport Funéraire</h2>
        <p className="text-gray-600">Remplissez les informations essentielles pour générer le document</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Deceased Information */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-slate-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Nom du Défunt</h3>
          </div>
          <div>
            <input
              type="text"
              required
              value={formData.deceased.name}
              onChange={(e) => handleDeceasedChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-lg"
              placeholder="Jean Dupont"
            />
          </div>
        </div>

        {/* Transport Information */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Transport</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                N° de LTA *
              </label>
              <input
                type="text"
                required
                value={formData.awbNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, awbNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AWB-987654321"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compagnie Aérienne *
              </label>
              <input
                type="text"
                required
                value={formData.flights[0].airline}
                onChange={(e) => handleFlightChange('airline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Air France"
              />
            </div>
          </div>
        </div>

        {/* Flight Information */}
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <Plane className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Vol & Itinéraire</h3>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              N° de Vol *
            </label>
            <input
              type="text"
              required
              value={formData.flights[0].flightNumber}
              onChange={(e) => handleFlightChange('flightNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="AF1234"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Departure */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <h4 className="font-medium text-gray-900">Départ</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aéroport (Code | Nom) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={formData.flights[0].departure.airportCode}
                    onChange={(e) => handleFlightChange('airportCode', e.target.value, 'departure')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="CDG"
                  />
                  <input
                    type="text"
                    required
                    value={formData.flights[0].departure.airport}
                    onChange={(e) => handleFlightChange('airport', e.target.value, 'departure')}
                    className="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Charles de Gaulle"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.flights[0].departure.date}
                    onChange={(e) => handleFlightChange('date', e.target.value, 'departure')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.flights[0].departure.time}
                    onChange={(e) => handleFlightChange('time', e.target.value, 'departure')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <h4 className="font-medium text-gray-900">Arrivée</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aéroport (Code | Nom) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={formData.flights[0].arrival.airportCode}
                    onChange={(e) => handleFlightChange('airportCode', e.target.value, 'arrival')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="JFK"
                  />
                  <input
                    type="text"
                    required
                    value={formData.flights[0].arrival.airport}
                    onChange={(e) => handleFlightChange('airport', e.target.value, 'arrival')}
                    className="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John F. Kennedy"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.flights[0].arrival.date}
                    onChange={(e) => handleFlightChange('date', e.target.value, 'arrival')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.flights[0].arrival.time}
                    onChange={(e) => handleFlightChange('time', e.target.value, 'arrival')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Générer le Document</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
