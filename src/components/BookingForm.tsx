import React, { useState } from 'react';
import { User, Plane, FileText, Save, Calendar, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { CaseData } from '../types/booking';

interface BookingFormProps {
  onSubmit: (data: CaseData) => void;
  initialData?: CaseData;
  isSubmitting?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, initialData, isSubmitting = false }) => {
  // Générer une date par défaut (dans 3 jours)
  const getDefaultDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toISOString().split('T')[0]
  }

  // Générer une heure par défaut
  const getDefaultTime = (baseHour: number) => {
    return `${baseHour.toString().padStart(2, '0')}:30`
  }

  const [hasConnection, setHasConnection] = useState(false)
  const [formData, setFormData] = useState<CaseData>(
    initialData || {
      dossierNumber: `DOS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,
      awbNumber: `12412345${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 10)}`,
      clientName: 'Pompes Funèbres Martin & Associés',
      clientContact: {
        email: 'contact@pf-martin.fr',
        phone: '+33 1 42 85 67 89'
      },
      bookingReference: `REF-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      bookingDate: new Date().toISOString().split('T')[0],
      flights: [{
        flightNumber: 'AH1006',
        airline: 'Air Algérie',
        departure: {
          airport: 'Paris-Orly',
          airportCode: 'ORY',
          date: getDefaultDate(),
          time: getDefaultTime(14)
        },
        arrival: {
          airport: 'Alger - Houari Boumediene',
          airportCode: 'ALG',
          date: getDefaultDate(),
          time: getDefaultTime(16)
        },
        aircraft: 'Boeing 737-800',
        duration: '2h 30m'
      }],
      deceased: {
        id: '1',
        name: 'Ahmed Ben Mohamed',
        type: 'HUM',
        ticketNumber: `TKT-${Math.floor(Math.random() * 900000) + 100000}`,
        specialRequirements: 'Transport réfrigéré requis - Manipulation avec précaution'
      },
      deliveryInfo: {
        date: (() => {
          const deliveryDate = new Date()
          deliveryDate.setDate(deliveryDate.getDate() + 4)
          return deliveryDate.toISOString().split('T')[0]
        })(),
        time: '10:00',
        location: 'Funérarium Central, 123 Avenue de la République, 16000 Alger'
      },
      specialInstructions: 'Coordonner avec l\'équipe de réception à l\'arrivée. Contact local requis 2h avant l\'atterrissage.',
      emergencyContact: {
        name: 'Fatima Ben Mohamed',
        phone: '+213 21 45 67 89'
      },
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    }
  );

  // Initialize connection flight data when toggle is activated
  const initializeConnectionFlight = () => {
    if (!hasConnection) {
      // Add second flight with default connection data
      const connectionDate = new Date(formData.flights[0].departure.date)
      connectionDate.setHours(connectionDate.getHours() + 3) // 3 hours later for connection
      
      const finalDate = new Date(connectionDate)
      finalDate.setHours(finalDate.getHours() + 2) // 2 hours for second flight
      
      setFormData(prev => ({
        ...prev,
        flights: [
          {
            ...prev.flights[0],
            arrival: {
              airport: 'Paris-Charles de Gaulle',
              airportCode: 'CDG',
              date: connectionDate.toISOString().split('T')[0],
              time: `${(parseInt(prev.flights[0].departure.time.split(':')[0]) + 2).toString().padStart(2, '0')}:45`
            }
          },
          {
            flightNumber: 'AF1395',
            airline: 'Air France',
            departure: {
              airport: 'Paris-Charles de Gaulle',
              airportCode: 'CDG',
              date: connectionDate.toISOString().split('T')[0],
              time: `${(parseInt(prev.flights[0].departure.time.split(':')[0]) + 4).toString().padStart(2, '0')}:15`
            },
            arrival: {
              airport: 'Alger - Houari Boumediene',
              airportCode: 'ALG',
              date: finalDate.toISOString().split('T')[0],
              time: `${(parseInt(prev.flights[0].departure.time.split(':')[0]) + 6).toString().padStart(2, '0')}:30`
            },
            aircraft: 'Airbus A320',
            duration: '2h 15m'
          }
        ]
      }))
    } else {
      // Remove second flight
      setFormData(prev => ({
        ...prev,
        flights: [prev.flights[0]]
      }))
    }
    setHasConnection(!hasConnection)
  }

  const handleFlightChange = (flightIndex: number, field: string, value: string, section?: string) => {
    setFormData(prev => ({
      ...prev,
      flights: prev.flights.map((flight, index) => 
        index === flightIndex ? {
          ...flight,
          ...(section ? {
            [section]: {
              ...flight[section as keyof typeof flight],
              [field]: value
            }
          } : {
            [field]: value
          })
        } : flight
      )
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
    
    // Prepare data with new variable structure for webhook
    const webhookData = {
      // Basic info
      deceasedName: formData.deceased.name,
      ltaNumber: formData.awbNumber,
      connectionFlight: hasConnection,
      
      // Airlines
      airline1: formData.flights[0]?.airline || '',
      ...(hasConnection && formData.flights.length > 1 ? {
        airline2: formData.flights[1]?.airline || '',
      } : {}),
      
      // Flight 1 (replaces original single flight variables)
      flightNumber1: formData.flights[0]?.flightNumber || '',
      departureAirport1: formData.flights[0]?.departure.airport || '',
      departureAirportCode1: formData.flights[0]?.departure.airportCode || '',
      departureDate1: formData.flights[0]?.departure.date || '',
      departureTime1: formData.flights[0]?.departure.time || '',
      
      ...(hasConnection && formData.flights.length > 1 ? {
        // Connection Airport
        connectionAirport: formData.flights[0]?.arrival.airport || '',
        connectionAirportCode: formData.flights[0]?.arrival.airportCode || '',
        connectionDate1: formData.flights[0]?.arrival.date || '',
        connectionTime1: formData.flights[0]?.arrival.time || '',
        connectionDate2: formData.flights[1]?.departure.date || '',
        connectionTime2: formData.flights[1]?.departure.time || '',
        
        // Flight 2
        flightNumber2: formData.flights[1]?.flightNumber || '',
        arrivalAirport2: formData.flights[1]?.arrival.airport || '',
        arrivalAirportCode2: formData.flights[1]?.arrival.airportCode || '',
        arrivalDate2: formData.flights[1]?.arrival.date || '',
        arrivalTime2: formData.flights[1]?.arrival.time || '',
      } : {
        // Direct flight - final destination is flight 1 arrival (no connection variables)
        arrivalAirport2: formData.flights[0]?.arrival.airport || '',
        arrivalAirportCode2: formData.flights[0]?.arrival.airportCode || '',
        arrivalDate2: formData.flights[0]?.arrival.date || '',
        arrivalTime2: formData.flights[0]?.arrival.time || '',
      }),
      
      // Metadata
      timestamp: new Date().toISOString(),
      source: 'SkyLogistics Dashboard'
    };
    
    console.log('Webhook data prepared:', webhookData);
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de vol</h3>
            </div>
            
            {/* Connection Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vol direct</span>
              <button
                type="button"
                onClick={initializeConnectionFlight}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  hasConnection ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    hasConnection ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connexion</span>
            </div>
          </div>

          {/* Flight 1 */}
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                {hasConnection ? 'Vol 1 (Premier segment)' : 'Vol direct'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    N° de vol *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.flights[0]?.flightNumber || ''}
                    onChange={(e) => handleFlightChange(0, 'flightNumber', e.target.value)}
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
                    value={formData.flights[0]?.airline || ''}
                    onChange={(e) => handleFlightChange(0, 'airline', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Air France"
                  />
                </div>
              </div>

              {/* Flight 1 Route */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Departure */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h5 className="font-medium text-gray-900 dark:text-white">Départ</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.flights[0]?.departure.airportCode || ''}
                        onChange={(e) => handleFlightChange(0, 'airportCode', e.target.value.toUpperCase(), 'departure')}
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
                        value={formData.flights[0]?.departure.airport || ''}
                        onChange={(e) => handleFlightChange(0, 'airport', e.target.value, 'departure')}
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
                        value={formData.flights[0]?.departure.date || ''}
                        onChange={(e) => handleFlightChange(0, 'date', e.target.value, 'departure')}
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
                        value={formData.flights[0]?.departure.time || ''}
                        onChange={(e) => handleFlightChange(0, 'time', e.target.value, 'departure')}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Arrival (Connection or Final) */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${hasConnection ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {hasConnection ? 'Connexion' : 'Arrivée'}
                    </h5>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.flights[0]?.arrival.airportCode || ''}
                        onChange={(e) => handleFlightChange(0, 'airportCode', e.target.value.toUpperCase(), 'arrival')}
                        className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors font-mono text-center ${
                          hasConnection ? 'focus:ring-yellow-500' : 'focus:ring-red-500'
                        }`}
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
                        value={formData.flights[0]?.arrival.airport || ''}
                        onChange={(e) => handleFlightChange(0, 'airport', e.target.value, 'arrival')}
                        className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                          hasConnection ? 'focus:ring-yellow-500' : 'focus:ring-red-500'
                        }`}
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
                        value={formData.flights[0]?.arrival.date || ''}
                        onChange={(e) => handleFlightChange(0, 'date', e.target.value, 'arrival')}
                        className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                          hasConnection ? 'focus:ring-yellow-500' : 'focus:ring-red-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Heure *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.flights[0]?.arrival.time || ''}
                        onChange={(e) => handleFlightChange(0, 'time', e.target.value, 'arrival')}
                        className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                          hasConnection ? 'focus:ring-yellow-500' : 'focus:ring-red-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight 2 (Connection) */}
            {hasConnection && formData.flights.length > 1 && (
              <div className="border-l-4 border-purple-500 pl-4 mt-8">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  Vol 2 (Segment de connexion)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      N° de vol *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.flights[1]?.flightNumber || ''}
                      onChange={(e) => handleFlightChange(1, 'flightNumber', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors font-mono"
                      placeholder="AF1395"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compagnie aérienne *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.flights[1]?.airline || ''}
                      onChange={(e) => handleFlightChange(1, 'airline', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Air France"
                    />
                  </div>
                </div>

                {/* Flight 2 Route */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Departure from Connection */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Départ (Connexion)</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.flights[1]?.departure.airportCode || ''}
                          onChange={(e) => handleFlightChange(1, 'airportCode', e.target.value.toUpperCase(), 'departure')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors font-mono text-center"
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
                          value={formData.flights[1]?.departure.airport || ''}
                          onChange={(e) => handleFlightChange(1, 'airport', e.target.value, 'departure')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
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
                          value={formData.flights[1]?.departure.date || ''}
                          onChange={(e) => handleFlightChange(1, 'date', e.target.value, 'departure')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Heure *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.flights[1]?.departure.time || ''}
                          onChange={(e) => handleFlightChange(1, 'time', e.target.value, 'departure')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Final Arrival */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Arrivée finale</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.flights[1]?.arrival.airportCode || ''}
                          onChange={(e) => handleFlightChange(1, 'airportCode', e.target.value.toUpperCase(), 'arrival')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors font-mono text-center"
                          placeholder="ALG"
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
                          value={formData.flights[1]?.arrival.airport || ''}
                          onChange={(e) => handleFlightChange(1, 'airport', e.target.value, 'arrival')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                          placeholder="Alger - Houari Boumediene"
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
                          value={formData.flights[1]?.arrival.date || ''}
                          onChange={(e) => handleFlightChange(1, 'date', e.target.value, 'arrival')}
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
                          value={formData.flights[1]?.arrival.time || ''}
                          onChange={(e) => handleFlightChange(1, 'time', e.target.value, 'arrival')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSubmitting ? 'Génération en cours...' : 'Générer le document'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;