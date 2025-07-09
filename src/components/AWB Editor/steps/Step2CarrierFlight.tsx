import React from 'react';
import { FormField } from '../FormField';
import { LTAData } from '../../types/lta';

interface Step2CarrierFlightProps {
  data: LTAData;
  updateData: (updates: Partial<LTAData>) => void;
}

export const Step2CarrierFlight: React.FC<Step2CarrierFlightProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Issuing Carrier's Agent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Name and City"
            value={data.issuingCarrierAgent.name}
            onChange={(value) => updateData({
              issuingCarrierAgent: { ...data.issuingCarrierAgent, name: value as string }
            })}
            placeholder="Enter agent name and city"
            required
          />
          <FormField
            label="City"
            value={data.issuingCarrierAgent.city}
            onChange={(value) => updateData({
              issuingCarrierAgent: { ...data.issuingCarrierAgent, city: value as string }
            })}
            placeholder="Enter city"
            required
          />
          <FormField
            label="IATA Code"
            value={data.issuingCarrierAgent.iataCode}
            onChange={(value) => updateData({
              issuingCarrierAgent: { ...data.issuingCarrierAgent, iataCode: value as string }
            })}
            placeholder="Enter IATA code"
            required
          />
          <FormField
            label="Account No"
            value={data.issuingCarrierAgent.accountNo}
            onChange={(value) => updateData({
              issuingCarrierAgent: { ...data.issuingCarrierAgent, accountNo: value as string }
            })}
            placeholder="Enter account number"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Routing and Flight Bookings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Departure"
            value={data.flightBooking.departure}
            onChange={(value) => updateData({
              flightBooking: { ...data.flightBooking, departure: value as string }
            })}
            placeholder="Departure airport (e.g., ORY - PARIS ORLY)"
            required
          />
          <FormField
            label="Route"
            value={data.flightBooking.route}
            onChange={(value) => updateData({
              flightBooking: { ...data.flightBooking, route: value as string }
            })}
            placeholder="Route (e.g., To ALG By First Carrier)"
            required
          />
          <FormField
            label="Destination"
            value={data.flightBooking.destination}
            onChange={(value) => updateData({
              flightBooking: { ...data.flightBooking, destination: value as string }
            })}
            placeholder="Destination (e.g., ALG - ALGIERS HB)"
            required
          />
          <FormField
            label="Flight/Date"
            value={data.flightBooking.flightDate}
            onChange={(value) => updateData({
              flightBooking: { ...data.flightBooking, flightDate: value as string }
            })}
            placeholder="Flight number and date (e.g., AH1005/11JUL25)"
            required
          />
          <FormField
            label="Carrier"
            value={data.flightBooking.carrier}
            onChange={(value) => updateData({
              flightBooking: { ...data.flightBooking, carrier: value as string }
            })}
            placeholder="Carrier (e.g., AIR ALGERIE)"
            required
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Handling Information</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Requirements"
            type="textarea"
            value={data.requirements}
            onChange={(value) => updateData({ requirements: value as string })}
            placeholder="Enter any special handling requirements"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
