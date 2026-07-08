import { Router, Response } from 'express';
import { CustomFood } from '../models/CustomFood';
import { estimateCalories } from '../services/calorieEstimator';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// POST / -> Create custom food (saves to DB and triggers AI calorie/macro estimate)
router.post('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { name, ingredients, oilTsp, sauceLevel, cookingMethod } = req.body;

  try {
    if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return sendError(res, 'Name and ingredients are required', 400, 'VALIDATION_ERROR');
    }

    const oTsp = oilTsp !== undefined ? Number(oilTsp) : 0;
    const sLevel = sauceLevel || 'none';
    const cMethod = cookingMethod || 'fried';

    // Calculate AI macro estimates (uses cache/fallback inside)
    const estimate = await estimateCalories(ingredients, oTsp, sLevel, cMethod);

    const customFood = await CustomFood.create({
      userId: req.user?.id,
      name,
      ingredients,
      baseCalories: estimate.calories,
      protein: estimate.protein,
      carbs: estimate.carbs,
      fat: estimate.fat,
      oilTsp: oTsp,
      sauceLevel: sLevel,
      aiAdjusted: estimate.source === 'ai'
    });

    return sendSuccess(res, customFood, 201);

  } catch (error) {
    console.error('Create custom food failed:', error);
    return sendError(res, 'Server error creating custom food', 500);
  }
});

// GET / -> List user's custom foods
router.get('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await CustomFood.find({ userId: req.user?.id }).sort({ name: 1 });
    return sendSuccess(res, list);
  } catch (error) {
    console.error('Fetch custom foods failed:', error);
    return sendError(res, 'Server error fetching custom foods', 500);
  }
});

// GET /:id -> Get single custom food
router.get('/:id', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const food = await CustomFood.findOne({ _id: id, userId: req.user?.id });
    if (!food) {
      return sendError(res, 'Custom food item not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, food);
  } catch (error) {
    console.error('Fetch custom food failed:', error);
    return sendError(res, 'Server error fetching custom food', 500);
  }
});

// DELETE /:id -> Delete custom food
router.delete('/:id', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const food = await CustomFood.findOneAndDelete({ _id: id, userId: req.user?.id });
    if (!food) {
      return sendError(res, 'Custom food not found or unauthorized', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, { message: 'Custom food deleted successfully' });
  } catch (error) {
    console.error('Delete custom food failed:', error);
    return sendError(res, 'Server error deleting custom food', 500);
  }
});

// POST /estimate -> AI macro estimation without saving
router.post('/estimate', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { ingredients, oilTsp, sauceLevel, cookingMethod } = req.body;

  try {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return sendError(res, 'Ingredients list is required for estimation', 400, 'VALIDATION_ERROR');
    }

    const oTsp = oilTsp !== undefined ? Number(oilTsp) : 0;
    const sLevel = sauceLevel || 'none';
    const cMethod = cookingMethod || 'fried';

    const estimate = await estimateCalories(ingredients, oTsp, sLevel, cMethod);
    return sendSuccess(res, estimate);

  } catch (error) {
    console.error('Estimate calories failed:', error);
    return sendError(res, 'Server error estimating calories', 500);
  }
});

export default router;
