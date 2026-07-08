import { Router, Response } from 'express';
import { WaterLog } from '../models/WaterLog';
import { User } from '../models/User';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// Helper to get start and end boundaries of a day
const getDayBoundaries = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// POST /log -> Log water intake (ml)
router.post('/log', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { amount, date } = req.body;

  try {
    if (!amount || Number(amount) <= 0) {
      return sendError(res, 'Amount must be a positive number of ml', 400, 'VALIDATION_ERROR');
    }

    const logEntry = await WaterLog.create({
      userId: req.user?.id,
      date: date ? new Date(date) : new Date(),
      amount: Number(amount),
      timestamp: date ? new Date(date) : new Date()
    });

    return sendSuccess(res, logEntry, 201);

  } catch (error) {
    console.error('Log water failed:', error);
    return sendError(res, 'Server error logging water intake', 500);
  }
});

// GET /today -> Today's total water intake
router.get('/today', protect, async (req: AuthenticatedRequest, res: Response) => {
  const dateStr = req.query.date as string;
  const { start, end } = getDayBoundaries(dateStr);

  try {
    const logs = await WaterLog.find({
      userId: req.user?.id,
      date: { $gte: start, $lte: end }
    });

    const user = await User.findById(req.user?.id);

    let totalAmount = 0;
    logs.forEach(log => {
      totalAmount += log.amount;
    });

    return sendSuccess(res, {
      totalAmountMl: totalAmount,
      targetWaterMl: user?.targetWater || 3000,
      percentage: Math.min(100, Math.round((totalAmount / (user?.targetWater || 3000)) * 100))
    });

  } catch (error) {
    console.error('Get today water failed:', error);
    return sendError(res, 'Server error fetching today water logs', 500);
  }
});

// GET /history -> 7-day water intake history
router.get('/history', protect, async (req: AuthenticatedRequest, res: Response) => {
  const dateStr = req.query.date as string;
  const pivotDate = dateStr ? new Date(dateStr) : new Date();

  try {
    const history = [];

    // Past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(pivotDate);
      d.setDate(d.getDate() - i);
      const { start, end } = getDayBoundaries(d.toISOString());

      const logs = await WaterLog.find({
        userId: req.user?.id,
        date: { $gte: start, $lte: end }
      });

      let dayTotal = 0;
      logs.forEach(log => {
        dayTotal += log.amount;
      });

      history.push({
        date: d.toISOString().split('T')[0],
        totalAmountMl: dayTotal
      });
    }

    return sendSuccess(res, history);

  } catch (error) {
    console.error('Get water history failed:', error);
    return sendError(res, 'Server error fetching water history', 500);
  }
});

export default router;
