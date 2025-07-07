import React from 'react';
import { Plane, Calendar, Clock, User, FileText, MapPin } from 'lucide-react';
import { CaseData } from '../types/booking';

interface BookingConfirmationTemplateProps {
  caseData: CaseData;
}

const BookingConfirmationTemplate: React.FC<BookingConfirmationTemplateProps> = ({ caseData }) => {
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

  const flight = caseData.flights[0];

  return (
    <div className="w-[210mm] min-h-[297mm] max-h-[297mm] mx-auto bg-white shadow-lg print:shadow-none print:w-full print:h-full print:m-0 flex flex-col relative overflow-hidden">
      {/* Top Left Company Logo */}
      <div className="absolute top-4 left-4 z-10">
        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-semibold text-slate-900 mt-1 text-center">SkyMasters</p>
      </div>

      {/* Top Right IATA Logo */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-xs">IATA</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-slate-900 text-white p-6 text-center pt-16">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-10 rounded-full mb-3">
          <Plane className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-light tracking-wide">Transport Funéraire</h1>
        <p className="text-slate-300 text-sm mt-1">Confirmation de Vol</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-6">
        {/* Card 1: Deceased Name */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center mb-2">
            <User className="w-4 h-4 text-slate-600 mr-2" />
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Nom du Défunt</h3>
          </div>
          <p className="text-xl font-light text-slate-900">{caseData.deceased.name}</p>
        </div>

        {/* Card 2: LTA & Airline */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-3">
            <FileText className="w-4 h-4 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wider">Transport</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">N° de LTA</p>
              <p className="text-lg font-light text-slate-900">{caseData.awbNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Compagnie Aérienne</p>
              <p className="text-lg font-light text-slate-900">{flight.airline}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Flight & Routing */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-3">
            <Plane className="w-4 h-4 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-green-600 uppercase tracking-wider">Vol & Itinéraire</h3>
          </div>
          
          {/* Flight Number */}
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-1">N° de Vol</p>
            <p className="text-xl font-light text-slate-900">{flight.flightNumber}</p>
          </div>

          {/* Routing */}
          <div className="grid grid-cols-2 gap-4">
            {/* Departure */}
            <div>
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Départ</p>
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-slate-900">
                  {flight.departure.airportCode} | {flight.departure.airport}
                </p>
                <div className="flex items-center space-x-3 text-slate-600 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(flight.departure.date)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-600 text-sm">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">{formatTime(flight.departure.time)}</span>
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div>
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">Arrivée</p>
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-slate-900">
                  {flight.arrival.airportCode} | {flight.arrival.airport}
                </p>
                <div className="flex items-center space-x-3 text-slate-600 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(flight.arrival.date)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-600 text-sm">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">{formatTime(flight.arrival.time)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 p-4 text-center border-t relative mt-auto">
        <div className="text-center">
          <h3 className="font-semibold text-slate-900 text-sm mb-1">SkyMasters Solutions</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bâtiment 125-D, rue du Thé<br />
            Zone Juliette<br />
            94310 Orly Aérogares
          </p>
        </div>
        
        {/* Bottom Right IATA Number */}
        <div className="absolute bottom-4 right-4 text-right">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-4 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">IATA</span>
            </div>
            <span className="text-xs font-mono text-slate-600">204 7065 921-5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationTemplate;