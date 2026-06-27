import { Router, Response } from 'express';
import { WorkoutLog, IWorkoutSet } from '../models/WorkoutLog';
import { Exercise } from '../models/Exercise';
import { User } from '../models/User';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError, PaginationInfo } from '../utils/apiResponse';
import { calculateStrengthBurn, calculateCardioBurn } from '../services/workoutBurnCalculator';
import { generateWorkoutPlan, analyzePerformance } from '../services/aiService';

const router = Router();

// Helper: Calculate total calories burned during a workout
const calculateWorkoutCalorieBurn = async (
  exercises: any[],
  userWeight: number,
  userAge: number,
  userGender: 'male' | 'female' | 'other',
  userRestingHR: number = 70,
  sessionDuration: number
): Promise<number> => {
  let totalCalories = 0;

  // Count cardio exercises to divide total time if set-level duration is missing
  let cardioExerciseCount = 0;
  const exercisesWithMetadata = [];

  for (const item of exercises) {
    const exerciseMeta = await Exercise.findById(item.exerciseId);
    if (exerciseMeta) {
      exercisesWithMetadata.push({ item, meta: exerciseMeta });
      if (exerciseMeta.category !== 'strength') {
        cardioExerciseCount++;
      }
    }
  }

  const defaultCardioDuration = cardioExerciseCount > 0 ? sessionDuration / cardioExerciseCount : 0;

  for (const { item, meta } of exercisesWithMetadata) {
    if (meta.category === 'strength') {
      const burn = calculateStrengthBurn(item.sets, {
        weight: userWeight,
        age: userAge,
        gender: userGender
      });
      totalCalories += burn;
    } else {
      // Cardio / HIIT / Yoga / Sports etc.
      let exerciseBurn = 0;
      for (const set of item.sets) {
        // duration in set is in seconds, convert to minutes
        const setDurationMinutes = set.duration ? set.duration / 60 : (defaultCardioDuration / item.sets.length);
        const burn = calculateCardioBurn(
          meta.met || 5,
          setDurationMinutes,
          userWeight,
          set.heartRate,
          userRestingHR
        );
        exerciseBurn += burn;
      }
      totalCalories += exerciseBurn;
    }
  }

  return Math.round(totalCalories * 10) / 10;
};

// POST / -> Log a workout session (automatically computes calories burned)
router.post('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionName, exercises, duration, mood, date } = req.body;

  try {
    if (!sessionName || !exercises || !Array.isArray(exercises) || exercises.length === 0 || !duration) {
      return sendError(res, 'Session name, exercises, and duration are required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    const calculatedBurn = await calculateWorkoutCalorieBurn(
      exercises,
      user.weight || 70,
      user.age || 25,
      user.gender || 'male',
      70, // default resting heart rate
      Number(duration)
    );

    const workoutLog = await WorkoutLog.create({
      userId: req.user?.id,
      date: date ? new Date(date) : new Date(),
      sessionName,
      exercises,
      totalCaloriesBurned: calculatedBurn,
      duration: Number(duration),
      mood
    });

    return sendSuccess(res, workoutLog, 201);

  } catch (error) {
    console.error('Create workout log failed:', error);
    return sendError(res, 'Server error logging workout', 500);
  }
});

// GET / -> List user's sessions (paginated)
router.get('/', protect, async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const skipIndex = (page - 1) * limit;
    const total = await WorkoutLog.countDocuments({ userId: req.user?.id });
    const logs = await WorkoutLog.find({ userId: req.user?.id })
      .sort({ date: -1 })
      .skip(skipIndex)
      .limit(limit)
      .populate('exercises.exerciseId');

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return sendSuccess(res, logs, 200, pagination);

  } catch (error) {
    console.error('Fetch workout logs failed:', error);
    return sendError(res, 'Server error fetching workout logs', 500);
  }
});

// GET /stats -> total volume, calories burned, streaks
router.get('/stats', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user?.id });

    let totalCaloriesBurned = 0;
    let totalDuration = 0;
    let totalSets = 0;

    logs.forEach(log => {
      totalCaloriesBurned += log.totalCaloriesBurned;
      totalDuration += log.duration;
      log.exercises.forEach(ex => {
        totalSets += ex.sets.length;
      });
    });

    return sendSuccess(res, {
      totalSessions: logs.length,
      totalCaloriesBurned: Math.round(totalCaloriesBurned),
      totalDurationMinutes: totalDuration,
      totalSetsLogged: totalSets
    });

  } catch (error) {
    console.error('Fetch workout stats failed:', error);
    return sendError(res, 'Server error fetching workout stats', 500);
  }
});

// GET /:id -> Single session detail
router.get('/:id', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const log = await WorkoutLog.findOne({ _id: id, userId: req.user?.id })
      .populate('exercises.exerciseId');

    if (!log) {
      return sendError(res, 'Workout session not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, log);

  } catch (error) {
    console.error('Fetch single workout failed:', error);
    return sendError(res, 'Server error fetching workout session details', 500);
  }
});

// DELETE /:id -> Remove a logged workout session
router.delete('/:id', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: id, userId: req.user?.id });
    if (!log) {
      return sendError(res, 'Workout session not found or unauthorized', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, { message: 'Workout session removed successfully' });

  } catch (error) {
    console.error('Delete workout session failed:', error);
    return sendError(res, 'Server error deleting session', 500);
  }
});

// POST /plan/generate -> AI-generate workout plan
router.post('/plan/generate', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { goal, experience, daysPerWeek, timePerSession, equipment } = req.body;

  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    const planReq = {
      goal: goal || user.goal || 'maintain',
      experience: experience || 'intermediate',
      daysPerWeek: daysPerWeek ? Number(daysPerWeek) : 3,
      timePerSession: timePerSession ? Number(timePerSession) : 45,
      equipment: equipment || ['dumbbell', 'bodyweight']
    };

    const planString = await generateWorkoutPlan(planReq);
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(planString);
    } catch {
      parsedPlan = { rawPlan: planString };
    }

    return sendSuccess(res, parsedPlan);

  } catch (error) {
    console.error('Generate workout plan failed:', error);
    return sendError(res, 'Server error generating workout plan', 500);
  }
});

// POST /analyze/:exerciseId -> AI performance analysis
router.post('/analyze/:exerciseId', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { exerciseId } = req.params;

  try {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return sendError(res, 'Exercise not found', 404, 'EXERCISE_NOT_FOUND');
    }

    // Find the latest two workouts containing this exercise
    const history = await WorkoutLog.find({
      userId: req.user?.id,
      'exercises.exerciseId': exerciseId
    })
      .sort({ date: -1 })
      .limit(2);

    if (history.length === 0) {
      return sendError(res, 'No logged workouts found for this exercise to analyze', 400, 'NO_HISTORY');
    }

    const currentWorkout = history[0];
    const previousWorkout = history[1] || null;

    const currentSets = currentWorkout.exercises.find(
      ex => ex.exerciseId.toString() === exerciseId
    )?.sets || [];

    const previousSets = previousWorkout ? previousWorkout.exercises.find(
      ex => ex.exerciseId.toString() === exerciseId
    )?.sets || [] : [];

    const feedback = await analyzePerformance(
      exercise.name,
      { sets: currentSets },
      { sets: previousSets }
    );

    return sendSuccess(res, { feedback });

  } catch (error) {
    console.error('Analyze workout performance failed:', error);
    return sendError(res, 'Server error analyzing performance', 500);
  }
});

export default router;
