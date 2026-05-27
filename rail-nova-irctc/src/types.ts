export type TravelClass = '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC';

export interface TrainClassAvailability {
  code: TravelClass;
  name: string;
  available: number;
  fare: number;
}

export interface Train {
  number: string;
  name: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  daysOfOperation: string[];
  classes: TrainClassAvailability[];
}

export interface SearchTrainsQuery {
  from: string;
  to: string;
  date: string;
  quota?: string;
  classCode?: TravelClass;
}

export interface Booking {
  id: string;
  userId: string;
  trainNumber: string;
  journeyDate: string;
  from: string;
  to: string;
  pnr: string;
  totalFare: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}