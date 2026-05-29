import express, { Request, Response } from 'express';
import cors from 'cors';
import trainRouter from './routes/trains.js';
import bookingRouter from './routes/bookings.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'railnova-api' });
});

app.get('/api/debug', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Mount routers
app.use('/api', trainRouter);
app.use('/api', bookingRouter);

app.listen(PORT, () => {
  console.log(`RailNova API running on http://localhost:${PORT}`);
});