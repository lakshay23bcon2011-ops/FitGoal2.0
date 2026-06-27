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

// Connect to Database
connectDB();

// Global Middlewares
app.use(helmet());
app.use(cors());
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
  res.json({ success: true, message: 'Server is healthy' });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
