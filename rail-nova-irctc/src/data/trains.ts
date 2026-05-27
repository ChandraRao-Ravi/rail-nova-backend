import type { Train } from '../types';

export const trains: Train[] = [
  {
    number: '12951',
    name: 'Mumbai Rajdhani',
    from: 'NDLS',
    to: 'BCT',
    departureTime: '16:55',
    arrivalTime: '09:30',
    durationMinutes: 935,
    daysOfOperation: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    classes: [
      { code: '1A', name: 'First AC',   available: 8,  fare: 3155 },
      { code: '2A', name: 'AC 2 Tier',  available: 12, fare: 1765 },
      { code: '3A', name: 'AC 3 Tier',  available: 24, fare: 1235 },
      { code: 'SL', name: 'Sleeper',    available: 42, fare: 700 }
    ]
  }
  // add more trains here
];