import React from 'react'
import { Package, CheckCircle, FileText, Calendar, User, Mail, Phone, Plane, MapPin, Clock, Truck, ArrowLeft, Printer } from 'lucide-react'

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

interface BookingConfirmationPreviewProps {
  data: BookingConfirmationData
  onBack: () => void
}

const BookingConfirmationPreview: React.FC<BookingConfirmationPreviewProps> = ({ data, onBack }) => {
  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    return timeString
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aperçu de la Confirmation</h2>
            <p className="text-gray-600 dark:text-gray-400">Vérifiez les informations avant impression</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Formulaire</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* PDF Preview Container */}
      <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-lg">
        {/* A4 Document */}
        <div className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg print:shadow-none print:w-full print:h-full print:m-0 text-xs leading-tight overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 print:bg-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 p-1.5 rounded-full">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Confirmation de Réservation Fret HUM</h1>
                  <p className="text-blue-100 text-xs">Transport de Dépouilles Mortelles</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100">Généré le</p>
                <p className="text-xs font-semibold">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="px-3 py-1.5 border-b text-green-600 bg-green-50">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3" />
              <span className="font-semibold text-xs uppercase tracking-wide">Réservation confirmée</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3 flex-1">
            
            {/* Document Info Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-1 mb-1">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <h3 className="font-semibold text-xs text-gray-900">Dossier</h3>
                </div>
                <p className="text-xs font-bold text-blue-600">{data.dossierNumber}</p>
              </div>
              
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-1 mb-1">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <h3 className="font-semibold text-xs text-gray-900">LTA</h3>
                </div>
                <p className="text-xs font-bold text-blue-600">{data.ltaNumber}</p>
              </div>
              
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-1 mb-1">
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <h3 className="font-semibold text-xs text-gray-900">Date de Réservation</h3>
                </div>
                <p className="text-xs font-semibold text-gray-900">{formatDate(data.reservationDate)}</p>
              </div>
            </div>

            {/* Deceased Information */}
            <div className="bg-purple-50 p-2 rounded border border-purple-200">
              <div className="flex items-center space-x-1 mb-1.5">
                <User className="w-3 h-3 text-purple-600" />
                <h3 className="font-bold text-gray-900 text-xs">Informations du Défunt</h3>
              </div>
              <div className="bg-white p-1.5 rounded border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">{data.deceasedName}</p>
                    <p className="text-xs text-gray-600">
                      Type : {data.deceasedType}
                      {data.deceasedReference && ` • Référence : ${data.deceasedReference}`}
                    </p>
                  </div>
                </div>
                {data.specialRequirements && (
                  <div className="mt-1 p-1.5 bg-blue-50 rounded">
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Exigences Particulières :</span> {data.specialRequirements}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-blue-50 p-2 rounded">
              <h3 className="font-bold text-gray-900 mb-1.5 text-xs">Informations Client</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-600">Client</p>
                  <p className="font-semibold text-gray-900 text-xs">{data.clientName}</p>
                </div>
                {data.clientReference && (
                  <div>
                    <p className="text-xs text-gray-600">Référence</p>
                    <p className="font-semibold text-gray-900 text-xs">{data.clientReference}</p>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-900">{data.clientEmail}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-900">{data.clientPhone}</span>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="border border-blue-200 rounded p-2">
              <h3 className="font-bold text-gray-900 mb-2 text-xs flex items-center space-x-1">
                <Plane className="w-3 h-3 text-blue-600" />
                <span>Détails du Vol</span>
              </h3>
              <div className="space-y-2">
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-600 text-xs">{data.flightNumber}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="font-semibold text-gray-900 text-xs">{data.airline}</span>
                    </div>
                    {data.aircraft && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Appareil</p>
                        <p className="font-semibold text-gray-900 text-xs">{data.aircraft}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Departure */}
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="w-3 h-3 text-green-600" />
                        <h4 className="font-semibold text-gray-900 text-xs">Départ</h4>
                      </div>
                      <div className="bg-green-50 p-1.5 rounded">
                        <p className="font-bold text-gray-900 text-xs">
                          {data.departureAirportName || data.departureAirport}
                        </p>
                        <p className="text-xs text-gray-600">({data.departureAirport})</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-2.5 h-2.5 text-gray-500" />
                            <span className="text-xs">{formatDate(data.departureDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5 text-gray-500" />
                            <span className="text-xs font-medium">{formatTime(data.departureTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div>
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="w-3 h-3 text-red-600" />
                        <h4 className="font-semibold text-gray-900 text-xs">Arrivée</h4>
                      </div>
                      <div className="bg-red-50 p-1.5 rounded">
                        <p className="font-bold text-gray-900 text-xs">
                          {data.arrivalAirportName || data.arrivalAirport}
                        </p>
                        <p className="text-xs text-gray-600">({data.arrivalAirport})</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-2.5 h-2.5 text-gray-500" />
                            <span className="text-xs">{formatDate(data.arrivalDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5 text-gray-500" />
                            <span className="text-xs font-medium">{formatTime(data.arrivalTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {data.flightDuration && (
                    <div className="text-center mt-1">
                      <span className="text-xs text-gray-600">Durée : </span>
                      <span className="font-semibold text-xs">{data.flightDuration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-orange-50 p-2 rounded">
                <h3 className="font-bold text-gray-900 mb-1.5 flex items-center space-x-1 text-xs">
                  <Truck className="w-3 h-3 text-orange-600" />
                  <span>Délai de Livraison</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-1.5 rounded border border-orange-200">
                    <div className="flex items-center space-x-1 mb-1">
                      <Calendar className="w-2.5 h-2.5 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">Date</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs">{formatDate(data.deliveryDate)}</p>
                  </div>
                  
                  <div className="bg-white p-1.5 rounded border border-orange-200">
                    <div className="flex items-center space-x-1 mb-1">
                      <Clock className="w-2.5 h-2.5 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">Heure</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs">{formatTime(data.deliveryTime)}</p>
                  </div>
                  
                  <div className="bg-white p-1.5 rounded border border-orange-200 col-span-1">
                    <div className="flex items-center space-x-1 mb-1">
                      <MapPin className="w-2.5 h-2.5 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">Lieu</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs">{data.deliveryLocation}</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {data.specialInstructions && (
                <div className="bg-yellow-50 p-2 rounded">
                  <h3 className="font-bold text-gray-900 mb-1 text-xs">Instructions Spéciales</h3>
                  <p className="text-gray-700 text-xs leading-relaxed">{data.specialInstructions}</p>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="bg-red-50 p-2 rounded">
                <h3 className="font-bold text-gray-900 mb-1 text-xs">Contact d'Urgence</h3>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-xs">{data.emergencyContactName}</span>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-2.5 h-2.5 text-gray-500" />
                    <span className="text-xs text-gray-900">{data.emergencyContactPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 p-2 text-center border-t print:bg-gray-50 mt-auto">
            <p className="text-xs text-gray-600 mb-1">
              Généré le : {formatDate(new Date().toISOString())} | {data.dossierNumber} | {data.ltaNumber}
            </p>
            <p className="text-xs text-gray-500">
              Veuillez conserver cette confirmation pour vos dossiers. Contactez-nous avec votre numéro de dossier pour toute modification.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmationPreview