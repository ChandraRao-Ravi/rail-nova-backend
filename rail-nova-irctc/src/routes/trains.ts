import { Router, Request, Response } from 'express';
import { trains } from '../data/trains';
import type { SearchTrainsQuery, Train } from '../types';

const router = Router();

// GET /search-trains?from=NDLS&to=BCT&date=2024-05-24&classCode=3A&quota=GENERAL
router.get('/search-trains', (req: Request, res: Response) => {
  const { from, to, date, classCode, quota } =
    req.query as Partial<SearchTrainsQuery>;

  if (!from || !to || !date) {
    return res.status(400).json({ error: 'from, to, date are required' });
  }

  let results: Train[] = trains.filter(
    t => t.from === from && t.to === to
  );

  if (classCode) {
    results = results.map(t => ({
      ...t,
      classes: t.classes.filter(c => c.code === classCode)
    }));
  }

  res.json({
    from,
    to,
    date,
    quota: quota ?? 'GENERAL',
    trains: results
  });
});

// GET /trains/12951
router.get('/trains/:number', (req: Request, res: Response) => {
  const train = trains.find(t => t.number === req.params.number);
  if (!train) return res.status(404).json({ error: 'Train not found' });
  res.json(train);
});

export default router;