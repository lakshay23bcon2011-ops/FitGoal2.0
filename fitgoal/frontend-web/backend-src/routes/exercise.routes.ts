import { Router, Request, Response } from 'express';
import { Exercise } from '../models/Exercise';
import { sendSuccess, sendError, PaginationInfo } from '../utils/apiResponse';

const router = Router();

// GET / -> Paginated list of all exercises
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const skipIndex = (page - 1) * limit;
    const total = await Exercise.countDocuments();
    const exercises = await Exercise.find()
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

    return sendSuccess(res, exercises, 200, pagination);

  } catch (error) {
    console.error('Fetch exercises failed:', error);
    return sendError(res, 'Server error fetching exercises', 500);
  }
});

// GET /search?q= -> Search by name or muscle group
router.get('/search', async (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;

  try {
    if (!searchTerm) {
      return sendSuccess(res, []);
    }

    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { muscleGroups: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const exercises = await Exercise.find(query).limit(30);
    return sendSuccess(res, exercises);

  } catch (error) {
    console.error('Exercise search failed:', error);
    return sendError(res, 'Server error searching exercises', 500);
  }
});

// GET /category/:cat -> Filter exercises by category (strength, cardio, yoga, etc.)
router.get('/category/:cat', async (req: Request, res: Response) => {
  const { cat } = req.params;

  try {
    const exercises = await Exercise.find({ category: cat.toLowerCase() }).sort({ name: 1 });
    return sendSuccess(res, exercises);
  } catch (error) {
    console.error('Fetch exercises by category failed:', error);
    return sendError(res, 'Server error fetching exercises', 500);
  }
});

// GET /muscle/:group -> Filter exercises by muscle group (chest, legs, shoulders, etc.)
router.get('/muscle/:group', async (req: Request, res: Response) => {
  const { group } = req.params;

  try {
    const exercises = await Exercise.find({
      muscleGroups: { $regex: new RegExp(`^${group}$`, 'i') }
    }).sort({ name: 1 });
    return sendSuccess(res, exercises);
  } catch (error) {
    console.error('Fetch exercises by muscle failed:', error);
    return sendError(res, 'Server error fetching exercises', 500);
  }
});

// GET /:id -> Get details of single exercise
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return sendError(res, 'Exercise not found', 404, 'EXERCISE_NOT_FOUND');
    }
    return sendSuccess(res, exercise);
  } catch (error) {
    console.error('Fetch exercise detail failed:', error);
    return sendError(res, 'Server error fetching exercise detail', 500);
  }
});

export default router;
