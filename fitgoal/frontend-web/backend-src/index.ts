import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error.middleware';

// Routes import
import authRoutes from './routes/auth.routes';
import foodRoutes from './routes/food.routes';
import foodlogRoutes from './routes/foodlog.routes';
import customfoodRoutes from './routes/customfood.routes';
import exerciseRoutes from './routes/exercise.routes';
import workoutRoutes from './routes/workout.routes';
import waterRoutes from './routes/water.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Lazy DB connection middleware — connects on first request, not at import time
app.use(async (_req: any, _res: any, next: any) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Global Middlewares
app.use(helmet());

// Improved CORS for production and development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches local development or any vercel.app deployment
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith('.vercel.app') ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin);

    if (!isAllowed) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/foodlog', foodlogRoutes);
app.use('/api/custom-food', customfoodRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/water', waterRoutes);

// Base health route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use(errorHandler);



export default app;
