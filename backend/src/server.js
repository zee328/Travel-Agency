import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import destinations from './routes/destinations.js';
import testimonials from './routes/testimonials.js';
import newsletter from './routes/newsletter.js';
import contact from './routes/contact.js';
import payment from './routes/payment.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0) return callback(null, true);
    return allowedOrigins.includes(origin)
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS'));
  }
}));

app.use(helmet());

// Parse JSON for all routes except webhook (webhook needs raw body)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/destinations', requireAuth, destinations);
app.use('/api/testimonials', testimonials);
app.use('/api/newsletter', formLimiter, newsletter);
app.use('/api/contact', formLimiter, contact);
app.use('/api/payment', payment);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
