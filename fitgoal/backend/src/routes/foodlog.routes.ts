import { Router, Response } from 'express';
import { FoodLog } from '../models/FoodLog';
import { User } from '../models/User';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// Helper to get start and end date for a given day
const getDayBoundaries = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// GET / -> Today's logged foods for authenticated user
router.get('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  const dateStr = req.query.date as string;
  const { start, end } = getDayBoundaries(dateStr);

  try {
    const logs = await FoodLog.find({
      userId: req.user?.id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    return sendSuccess(res, logs);
  } catch (error) {
    console.error('Fetch today logs failed:', error);
    return sendError(res, 'Server error fetching logs', 500);
  }
});

// POST / -> Log a food item
router.post('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  const {
    mealType,
    foodType,
    foodId,
    foodName,
    quantity,
    unit,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    oilLevel,
    spiceLevel,
    aiAdjusted,
    date
  } = req.body;

  try {
    if (!mealType || !foodType || !foodName || quantity === undefined || !unit || calories === undefined) {
      return sendError(res, 'Missing required fields for logging food', 400, 'VALIDATION_ERROR');
    }

    const logEntry = await FoodLog.create({
      userId: req.user?.id,
      date: date ? new Date(date) : new Date(),
      mealType,
      foodType,
      foodId,
      foodName,
      quantity,
      unit,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
      oilLevel: oilLevel || 0,
      spiceLevel: spiceLevel || 'none',
      aiAdjusted: !!aiAdjusted
    });

    return sendSuccess(res, logEntry, 201);

  } catch (error) {
    console.error('Add food log failed:', error);
    return sendError(res, 'Server error logging food', 500);
  }
});

// DELETE /:id -> Remove logged food item
router.delete('/:id', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const log = await FoodLog.findOneAndDelete({
      _id: id,
      userId: req.user?.id
    });

    if (!log) {
      return sendError(res, 'Food log entry not found or unauthorized', 404, 'LOG_NOT_FOUND');
    }

    return sendSuccess(res, { message: 'Logged item removed successfully' });

  } catch (error) {
    console.error('Delete food log failed:', error);
    return sendError(res, 'Server error deleting logged item', 500);
  }
});

// GET /stats/daily -> Sum of calories/macros for today vs target
router.get('/stats/daily', protect, async (req: AuthenticatedRequest, res: Response) => {
  const dateStr = req.query.date as string;
  const { start, end } = getDayBoundaries(dateStr);

  try {
    const logs = await FoodLog.find({
      userId: req.user?.id,
      date: { $gte: start, $lte: end }
    });

    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    const summary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };

    logs.forEach(log => {
      summary.calories += log.calories;
      summary.protein += log.protein;
      summary.carbs += log.carbs;
      summary.fat += log.fat;
      summary.fiber += log.fiber;
    });

    // Round values
    summary.calories = Math.round(summary.calories);
    summary.protein = Math.round(summary.protein * 10) / 10;
    summary.carbs = Math.round(summary.carbs * 10) / 10;
    summary.fat = Math.round(summary.fat * 10) / 10;
    summary.fiber = Math.round(summary.fiber * 10) / 10;

    const stats = {
      consumed: summary,
      targets: {
        calories: user.targetCalories || 2000,
        protein: user.targetProtein || 120,
        carbs: user.targetCarbs || 200,
        fat: user.targetFat || 65,
        water: user.targetWater || 3000
      },
      remaining: {
        calories: Math.max(0, (user.targetCalories || 2000) - summary.calories),
        protein: Math.max(0, (user.targetProtein || 120) - summary.protein),
        carbs: Math.max(0, (user.targetCarbs || 200) - summary.carbs),
        fat: Math.max(0, (user.targetFat || 65) - summary.fat)
      }
    };

    return sendSuccess(res, stats);

  } catch (error) {
    console.error('Fetch daily stats failed:', error);
    return sendError(res, 'Server error fetching daily stats', 500);
  }
});

// GET /stats/weekly -> 7-day trend data (calories and macro history)
router.get('/stats/weekly', protect, async (req: AuthenticatedRequest, res: Response) => {
  const dateStr = req.query.date as string;
  const pivotDate = dateStr ? new Date(dateStr) : new Date();

  try {
    const trend = [];

    // Loop through past 7 days (including pivot day)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(pivotDate);
      d.setDate(d.getDate() - i);
      const { start, end } = getDayBoundaries(d.toISOString());

      const dayLogs = await FoodLog.find({
        userId: req.user?.id,
        date: { $gte: start, $lte: end }
      });

      const daySummary = {
        date: d.toISOString().split('T')[0],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };

      dayLogs.forEach(log => {
        daySummary.calories += log.calories;
        daySummary.protein += log.protein;
        daySummary.carbs += log.carbs;
        daySummary.fat += log.fat;
        daySummary.fiber += log.fiber;
      });

      daySummary.calories = Math.round(daySummary.calories);
      daySummary.protein = Math.round(daySummary.protein * 10) / 10;
      daySummary.carbs = Math.round(daySummary.carbs * 10) / 10;
      daySummary.fat = Math.round(daySummary.fat * 10) / 10;
      daySummary.fiber = Math.round(daySummary.fiber * 10) / 10;

      trend.push(daySummary);
    }

    return sendSuccess(res, trend);

  } catch (error) {
    console.error('Fetch weekly stats failed:', error);
    return sendError(res, 'Server error fetching weekly stats', 500);
  }
});

export default router;
