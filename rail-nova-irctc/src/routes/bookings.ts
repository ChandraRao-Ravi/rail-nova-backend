import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import type { Booking } from '../types';

const router = Router();

// in-memory store
const bookings: Booking[] = [];

router.post('/bookings', (req: Request, res: Response) => {
  const { userId, trainNumber, journeyDate, from, to, totalFare } = req.body;

  if (!userId || !trainNumber || !journeyDate || !from || !to || !totalFare) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const booking: Booking = {
    id: randomUUID(),
    userId,
    trainNumber,
    journeyDate,
    from,
    to,
    pnr: Math.floor(1e9 + Math.random() * 9e9).toString(),
    totalFare,
    status: 'CONFIRMED'
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

router.get('/users/:userId/bookings', (req: Request, res: Response) => {
  const userBookings = bookings.filter(b => b.userId === req.params.userId);
  res.json(userBookings);
});

export default router;