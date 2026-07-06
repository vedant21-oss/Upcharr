import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler';
import patientsRouter from './routes/patients';
import appointmentsRouter from './routes/appointments';
import prescriptionsRouter from './routes/prescriptions';
import queueRouter from './routes/queue';
import miscRouter from './routes/misc';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://upchaar.vercel.app',
    /\.vercel\.app$/,
    /\.render\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Upchaar Healthcare API',
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/queue', queueRouter);
app.use('/api', miscRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`🏥 UPCHAAR API v2.0 → http://localhost:${PORT}`);
  console.log(`📊 Supabase → ${process.env.SUPABASE_URL}`);
  console.log('==================================================');
});

export default app;
