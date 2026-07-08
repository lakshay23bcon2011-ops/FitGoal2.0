import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// Helper to generate JWT
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: '7d'
  });
};

// Helper to calculate target calories and macros
const calculateTargets = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  goal: 'bulk' | 'cut' | 'maintain',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
) => {
  // Mifflin-St Jeor Formula
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  const bmr = gender === 'male' ? baseBMR + 5 : baseBMR - 161;

  // Activity multipliers
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  const tdee = bmr * (multipliers[activityLevel] || 1.2);

  // Goal adjustments
  let targetCalories = Math.round(tdee);
  if (goal === 'bulk') {
    targetCalories += 400;
  } else if (goal === 'cut') {
    targetCalories -= 450;
  }

  // Ensure minimum floor calories
  targetCalories = Math.max(1200, targetCalories);

  // Target Macros
  // Protein: 2.0g per kg of bodyweight
  const targetProtein = Math.round(weight * 2.0);
  // Fat: 20-30% of target calories, let's say 25% (1g fat = 9 kcal)
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  // Carbs: Remaining calories (1g carb = 4 kcal)
  const proteinKcal = targetProtein * 4;
  const fatKcal = targetFat * 9;
  const targetCarbs = Math.max(50, Math.round((targetCalories - (proteinKcal + fatKcal)) / 4));
  // Water: 35ml per kg of bodyweight, baseline 3000ml
  const targetWater = Math.max(3000, Math.round(weight * 35));

  return { targetCalories, targetProtein, targetCarbs, targetFat, targetWater };
};

// POST /register
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, age, weight, height, gender, goal, activityLevel } = req.body;

  try {
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400, 'USER_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Calculate dynamic calorie & macro targets
    const uAge = age || 25;
    const uWeight = weight || 70;
    const uHeight = height || 170;
    const uGender = gender || 'male';
    const uGoal = goal || 'maintain';
    const uActivity = activityLevel || 'moderate';

    const targets = calculateTargets(uWeight, uHeight, uAge, uGender, uGoal, uActivity);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      age: uAge,
      weight: uWeight,
      height: uHeight,
      gender: uGender,
      goal: uGoal,
      activityLevel: uActivity,
      ...targets
    });

    const token = generateToken(user._id.toString());

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        goal: user.goal,
        activityLevel: user.activityLevel,
        targetCalories: user.targetCalories,
        targetProtein: user.targetProtein,
        targetCarbs: user.targetCarbs,
        targetFat: user.targetFat,
        targetWater: user.targetWater
      }
    }, 211); // Custom status code or 201

  } catch (error) {
    console.error('Registration failed:', error);
    return sendError(res, 'Registration failed', 500);
  }
});

// POST /login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Invalid credentials', 400, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 400, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user._id.toString());

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        goal: user.goal,
        activityLevel: user.activityLevel,
        targetCalories: user.targetCalories,
        targetProtein: user.targetProtein,
        targetCarbs: user.targetCarbs,
        targetFat: user.targetFat,
        targetWater: user.targetWater
      }
    });

  } catch (error) {
    console.error('Login failed:', error);
    return sendError(res, 'Login failed', 500);
  }
});

// GET /me
router.get('/me', protect, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const user = await User.findById(authReq.user?.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    return sendSuccess(res, user);
  } catch (error) {
    console.error('Get me failed:', error);
    return sendError(res, 'Server error', 500);
  }
});

// PUT /profile
router.put('/profile', protect, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { name, age, weight, height, gender, goal, activityLevel, targetCalories, targetProtein, targetCarbs, targetFat, targetWater } = req.body;

  try {
    const user = await User.findById(authReq.user?.id);
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    // Set fields
    if (name) user.name = name;
    if (age) user.age = age;
    if (weight) user.weight = weight;
    if (height) user.height = height;
    if (gender) user.gender = gender;
    if (goal) user.goal = goal;
    if (activityLevel) user.activityLevel = activityLevel;

    // Recalculate default targets if body properties changed and custom targets aren't explicitly passed
    const triggersRecalculate = age || weight || height || gender || goal || activityLevel;
    const targetsPassed = targetCalories || targetProtein || targetCarbs || targetFat || targetWater;

    if (triggersRecalculate && !targetsPassed) {
      const newTargets = calculateTargets(user.weight, user.height, user.age, user.gender, user.goal, user.activityLevel);
      user.targetCalories = newTargets.targetCalories;
      user.targetProtein = newTargets.targetProtein;
      user.targetCarbs = newTargets.targetCarbs;
      user.targetFat = newTargets.targetFat;
      user.targetWater = newTargets.targetWater;
    } else {
      // Overwrite with customized targets if provided
      if (targetCalories) user.targetCalories = targetCalories;
      if (targetProtein) user.targetProtein = targetProtein;
      if (targetCarbs) user.targetCarbs = targetCarbs;
      if (targetFat) user.targetFat = targetFat;
      if (targetWater) user.targetWater = targetWater;
    }

    await user.save();

    const updatedUser = user.toObject();
    delete (updatedUser as any).passwordHash;

    return sendSuccess(res, updatedUser);

  } catch (error) {
    console.error('Update profile failed:', error);
    return sendError(res, 'Update profile failed', 500);
  }
});

export default router;
