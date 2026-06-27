import { Router, Request, Response } from 'express';
import { IndianFood } from '../models/IndianFood';
import { sendSuccess, sendError, PaginationInfo } from '../utils/apiResponse';

const router = Router();

// GET / -> Paginated, filterable list of Indian foods
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const category = req.query.category as string;
  const vegetarian = req.query.vegetarian === 'true';
  const vegan = req.query.vegan === 'true';
  const jain = req.query.jain === 'true';

  try {
    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (vegetarian) {
      query.isVegetarian = true;
    }
    if (vegan) {
      query.isVegan = true;
    }
    if (jain) {
      query.isJain = true;
    }

    const skipIndex = (page - 1) * limit;
    const total = await IndianFood.countDocuments(query);
    const foods = await IndianFood.find(query)
      .sort({ name: 1 })
      .skip(skipIndex)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return sendSuccess(res, foods, 200, pagination);

  } catch (error) {
    console.error('Fetch foods failed:', error);
    return sendError(res, 'Server error fetching foods', 500);
  }
});

// GET /search?q= -> Shortcut regex search by name
router.get('/search', async (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;

  try {
    if (!searchTerm) {
      return sendSuccess(res, []);
    }

    const foods = await IndianFood.find({
      name: { $regex: searchTerm, $options: 'i' }
    }).limit(20);

    return sendSuccess(res, foods);

  } catch (error) {
    console.error('Food regex search failed:', error);
    return sendError(res, 'Server error searching foods', 500);
  }
});

// GET /:id -> Get single food item detail
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const food = await IndianFood.findById(id);
    if (!food) {
      return sendError(res, 'Food item not found', 404, 'FOOD_NOT_FOUND');
    }
    return sendSuccess(res, food);

  } catch (error) {
    console.error('Fetch single food failed:', error);
    return sendError(res, 'Server error fetching food item', 500);
  }
});

export default router;
