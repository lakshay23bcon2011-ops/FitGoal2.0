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

// GET /search?q= -> Shortcut regex search by name & tags
router.get('/search', async (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;

  try {
    if (!searchTerm || !searchTerm.trim()) {
      return sendSuccess(res, []);
    }

    const trimmed = searchTerm.trim();
    const regex = new RegExp(trimmed, 'i');

    const foods = await IndianFood.find({
      $or: [
        { name: regex },
        { nameHindi: regex },
        { tags: regex },
        { category: regex }
      ]
    }).limit(30);

    const termLower = trimmed.toLowerCase();

    // Sort: prioritize exact name match, prefix match, raw ingredients, and shorter names
    foods.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      if (aName === termLower && bName !== termLower) return -1;
      if (bName === termLower && aName !== termLower) return 1;

      const aStarts = aName.startsWith(termLower);
      const bStarts = bName.startsWith(termLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const rawKeywords = ['raw', 'plain', 'boiled', 'flour', 'atta', 'rice', 'dal', 'paneer', 'milk', 'egg', 'oil', 'oats', 'curd', 'dahi', 'roti', 'chapati', 'chicken', 'paneer'];
      const aIsRaw = rawKeywords.some(k => aName.includes(k));
      const bIsRaw = rawKeywords.some(k => bName.includes(k));
      if (aIsRaw && !bIsRaw) return -1;
      if (!aIsRaw && bIsRaw) return 1;

      return aName.length - bName.length;
    });

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
