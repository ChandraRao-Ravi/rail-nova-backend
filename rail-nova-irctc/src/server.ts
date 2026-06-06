import express, { Request, Response } from 'express';
import cors from 'cors';
import trainRouter from './routes/trains';
import bookingRouter from './routes/bookings';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'railnova-api' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'railnova-api' });
});

app.get('/api/debug', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Mount routers
app.use('/api', authRouter);
app.use('/api', profileRouter);
app.use('/api', trainRouter);
app.use('/api', bookingRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});