import { Router, Request, Response } from 'express';
import pool from '../db'; // adjust path if needed

const router = Router();

// POST /users/:userId/bookings
router.post(
  '/users/:userId/bookings',
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    const {
      trainNumber,
      fromStation,
      toStation,
      journeyDate, // e.g. "2026-05-30T10:00:00Z"
      totalFare,
    } = req.body as {
      trainNumber?: string;
      fromStation?: string;
      toStation?: string;
      journeyDate?: string;
      totalFare?: number;
    };

    if (
      !trainNumber ||
      !fromStation ||
      !toStation ||
      !journeyDate ||
      totalFare == null
    ) {
      return res
        .status(400)
        .json({ error: 'Missing required fields' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO bookings 
         (user_id, train_number, from_station, to_station, journey_date, total_fare)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          trainNumber,
          fromStation,
          toStation,
          journeyDate,
          totalFare,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error inserting booking', err);
      res
        .status(500)
        .json({ error: 'Failed to create booking' });
    }
  }
);

// GET /users/:userId/bookings
router.get(
  '/users/:userId/bookings',
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
      const result = await pool.query(
        `SELECT *
         FROM bookings
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching bookings', err);
      res
        .status(500)
        .json({ error: 'Failed to fetch bookings' });
    }
  }
);

export default router;