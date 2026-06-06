import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { createStripeWebhookRouter } from './routes/subscription';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true }));

// Stripe webhook must use raw body — mount BEFORE express.json()
app.use('/api/webhooks', createStripeWebhookRouter());

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Savora API running on port ${PORT}`);
});

export default app;
