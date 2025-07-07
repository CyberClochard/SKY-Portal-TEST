export interface CaseData {
  dossierNumber: string;
  awbNumber: string;
  clientName: string;
  clientContact: {
    email: string;
    phone: string;
  };
  bookingReference: string;
  bookingDate: string;
  flights: Array<{
    flightNumber: string;
    airline: string;
    departure: {
      airport: string;
      airportCode: string;
      date: string;
      time: string;
    };
    arrival: {
      airport: string;
      airportCode: string;
      date: string;
      time: string;
    };
    aircraft: string;
    duration: string;
  }>;
  deceased: {
    id: string;
    name: string;
    type: string;
    ticketNumber: string;
    specialRequirements: string;
  };
  deliveryInfo: {
    date: string;
    time: string;
    location: string;
  };
  specialInstructions: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  createdAt: string;
  status: string;
}
