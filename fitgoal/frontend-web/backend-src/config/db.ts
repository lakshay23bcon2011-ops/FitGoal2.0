import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
  // Skip during Next.js production build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!connectionPromise) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitgoal';
    connectionPromise = mongoose.connect(mongoUri)
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error('Database connection error:', error);
        throw error;
      });
  }

  return connectionPromise;
};
