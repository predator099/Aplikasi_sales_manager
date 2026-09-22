import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../src/server/api';

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

app.get(['/api/health', '/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', app: 'ANTEN Business Manager Vercel API' });
});

// All API routes
app.use('/api', apiRouter);

export default app;
