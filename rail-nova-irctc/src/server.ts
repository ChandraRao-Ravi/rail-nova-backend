import express, { Request, Response } from 'express';
import cors from 'cors';
import trainRoutes from './routes/trains';
import bookingRoutes from './routes/bookings';

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
app.use('/api', trainRoutes);
app.use('/api', bookingRoutes);

app.listen(PORT, () => {
  console.log(`RailNova API running on http://localhost:${PORT}`);
});