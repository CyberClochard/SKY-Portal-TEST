import React, { useState } from 'react'
import { FileText, User, MapPin, Calendar, Plane, Truck, Mail, Phone, Clock, Package, AlertTriangle } from 'lucide-react'

interface BookingConfirmationData {
  // Document info
  dossierNumber: string
  ltaNumber: string
  reservationDate: string
  
  // Deceased info
  deceasedName: string
  deceasedType: string
  deceasedReference: string
  specialRequirements: string
  
  // Client info
  clientName: string
  clientReference: string
  clientEmail: string
  clientPhone: string
  
  // Flight info
  flightNumber: string
  airline: string
  aircraft: string
  departureAirport: string
  departureAirportName: string
  departureDate: string
  departureTime: string
  arrivalAirport: string
  arrivalAirportName: string
  arrivalDate: string
  arrivalTime: string
  flightDuration: string
  
  // Delivery info
  deliveryDate: string
  deliveryTime: string
  deliveryLocation: string
  
  // Special instructions
  specialInstructions: string
  
  // Emergency contact
  emergencyContactName: string
  emergencyContactPhone: string
}

interface BookingConfirmationFormProps {
  onGenerate: (data: BookingConfirmationData) => void
}

const BookingConfirmationForm: React.FC<BookingConfirmationFormProps> = ({ onGenerate }) => {
  const [formData, setFormData] = useState<BookingConfirmationData>({
    // Document info
    dossierNumber: '',
    ltaNumber: '',
    reservationDate: new Date().toISOString().split('T')[0],
    
    // Deceased info
    deceasedName: '',
    deceasedType: 'HUM',
    deceasedReference: '',
    specialRequirements: '',
    
    // Client info
    clientName: '',
    clientReference: '',
    clientEmail: '',
    clientPhone: '',
    
    // Flight info
    flightNumber: '',
    airline: '',
    aircraft: '',
    departureAirport: '',
    departureAirportName: '',
    departureDate: '',
    departureTime: '',
    arrivalAirport: '',
    arrivalAirportName: '',
    arrivalDate: '',
    arrivalTime: '',
    flightDuration: '',
    
    // Delivery info
    deliveryDate: '',
    deliveryTime: '',
    deliveryLocation: '',
    
    // Special instructions
    specialInstructions: '',
    
    // Emergency contact
    emergencyContactName: '',
    emergencyContactPhone: ''
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: keyof BookingConfirmationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = (): string[] => {
    const validationErrors: string[] = []
    
    // Required fields validation
    const requiredFields = [
      { field: 'dossierNumber', label: 'Numéro de dossier' },
      { field: 'ltaNumber', label: 'Numéro LTA' },
      { field: 'deceasedName', label: 'Nom du défunt' },
      { field: 'clientName', label: 'Nom du client' },
      { field: 'clientEmail', label: 'Email du client' },
      { field: 'clientPhone', label: 'Téléphone du client' },
      { field: 'flightNumber', label: 'Numéro de vol' },
      { field: 'airline', label: 'Compagnie aérienne' },
      { field: 'departureAirport', label: 'Aéroport de départ' },
      { field: 'arrivalAirport', label: 'Aéroport d\'arrivée' },
      { field: 'departureDate', label: 'Date de départ' },
      { field: 'departureTime', label: 'Heure de départ' },
      { field: 'arrivalDate', label: 'Date d\'arrivée' },
      { field: 'arrivalTime', label: 'Heure d\'arrivée' },
      { field: 'deliveryDate', label: 'Date de livraison' },
      { field: 'deliveryTime', label: 'Heure de livraison' },
      { field: 'deliveryLocation', label: 'Lieu de livraison' },
      { field: 'emergencyContactName', label: 'Contact d\'urgence' },
      { field: 'emergencyContactPhone', label: 'Téléphone d\'urgence' }
    ]
    
    requiredFields.forEach(({ field, label }) => {
      if (!formData[field as keyof BookingConfirmationData]?.trim()) {
        validationErrors.push(`${label} est requis`)
      }
    })
    
    // Email validation
    if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      validationErrors.push('Format d\'email invalide')
    }
    
    // Date validation
    const today = new Date().toISOString().split('T')[0]
    if (formData.departureDate && formData.departureDate < today) {
      validationErrors.push('La date de départ ne peut pas être dans le passé')
    }
    
    return validationErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    onGenerate(formData)
  }

  const generateDossierNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0')
    return `DOS-${year}-${month}${day}${time}`
  }

  const generateLTANumber = () => {
    const timestamp = Date.now().toString().slice(-9)
    return `AWB-${timestamp}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirmation de Réservation Fret HUM</h2>
            <p className="text-gray-600 dark:text-gray-400">Générer une confirmation de transport de dépouilles mortelles</p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erreurs de validation :</p>
              <ul className="text-sm mt-1 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Document Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Informations du Document</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de Dossier *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.dossierNumber}
                  onChange={(e) => handleInputChange('dossierNumber', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DOS-2024-123456"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('dossierNumber', generateDossierNumber())}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Auto
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro LTA *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.ltaNumber}
                  onChange={(e) => handleInputChange('ltaNumber', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AWB-987654321"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('ltaNumber', generateLTANumber())}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Auto
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de Réservation *
              </label>
              <input
                type="date"
                value={formData.reservationDate}
                onChange={(e) => handleInputChange('reservationDate', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Deceased Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-purple-600" />
            <span>Informations du Défunt</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du Défunt *
              </label>
              <input
                type="text"
                value={formData.deceasedName}
                onChange={(e) => handleInputChange('deceasedName', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean Dupont"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.deceasedType}
                onChange={(e) => handleInputChange('deceasedType', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HUM">HUM</option>
                <option value="CRM">CRM</option>
                <option value="URN">URN</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Référence
              </label>
              <input
                type="text"
                value={formData.deceasedReference}
                onChange={(e) => handleInputChange('deceasedReference', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="TKT-789123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exigences Particulières
              </label>
              <input
                type="text"
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transport réfrigéré requis"
              />
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Informations Client</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du Client *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pompes Funèbres Martin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Référence Client
              </label>
              <input
                type="text"
                value={formData.clientReference}
                onChange={(e) => handleInputChange('clientReference', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="REF-2024-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@pf-martin.fr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>
        </div>

        {/* Flight Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <span>Informations de Vol</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de Vol *
              </label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AF1234"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compagnie Aérienne *
              </label>
              <input
                type="text"
                value={formData.airline}
                onChange={(e) => handleInputChange('airline', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Air France"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appareil
              </label>
              <input
                type="text"
                value={formData.aircraft}
                onChange={(e) => handleInputChange('aircraft', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Boeing 777-300ER"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aéroport de Départ *
              </label>
              <input
                type="text"
                value={formData.departureAirport}
                onChange={(e) => handleInputChange('departureAirport', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CDG"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom Aéroport Départ
              </label>
              <input
                type="text"
                value={formData.departureAirportName}
                onChange={(e) => handleInputChange('departureAirportName', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Charles de Gaulle"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aéroport d'Arrivée *
              </label>
              <input
                type="text"
                value={formData.arrivalAirport}
                onChange={(e) => handleInputChange('arrivalAirport', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JFK"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom Aéroport Arrivée
              </label>
              <input
                type="text"
                value={formData.arrivalAirportName}
                onChange={(e) => handleInputChange('arrivalAirportName', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John F. Kennedy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de Départ *
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => handleInputChange('departureDate', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heure de Départ *
              </label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => handleInputChange('departureTime', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date d'Arrivée *
              </label>
              <input
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heure d'Arrivée *
              </label>
              <input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Durée du Vol
              </label>
              <input
                type="text"
                value={formData.flightDuration}
                onChange={(e) => handleInputChange('flightDuration', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8h 15m"
              />
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-orange-600" />
            <span>Informations de Livraison</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de Livraison *
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heure de Livraison *
              </label>
              <input
                type="time"
                value={formData.deliveryTime}
                onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lieu de Livraison *
              </label>
              <input
                type="text"
                value={formData.deliveryLocation}
                onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Funérarium Central, 123 Rue de la Paix, Paris"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Informations Complémentaires</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions Spéciales
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Manipulation avec précaution. Coordonner avec l'équipe de réception."
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact d'Urgence *
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Marie Dupont"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone d'Urgence *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="flex items-center space-x-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
          >
            <FileText className="w-5 h-5" />
            <span>Générer la Confirmation</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookingConfirmationForm