import { cache } from '../utils/cache';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
  source: 'ai' | 'fallback';
}

const FALLBACK_MODIFIERS = {
  oilPerTsp: { calories: 45, fat: 5 },
  lightSauce: { calories: 20, carbs: 4 },
  mediumSauce: { calories: 40, carbs: 8 },
  heavySauce: { calories: 70, carbs: 14 }
};

export async function estimateCalories(
  ingredients: Ingredient[],
  oilTsp: number = 0,
  sauceLevel: 'none' | 'light' | 'medium' | 'heavy' = 'none',
  cookingMethod: string = 'steamed'
): Promise<MacroResult> {
  const cacheKey = `calories:${JSON.stringify({ ingredients, oilTsp, sauceLevel, cookingMethod })}`;
  const cached = cache.get<MacroResult>(cacheKey);
  if (cached) return cached;

  const ingredientsText = ingredients.map(i => `${i.quantity} ${i.unit} of ${i.name}`).join(', ');

  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      throw new Error('No Groq API key configuration found. Running fallback.');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: `You are a precise nutrition calculator specializing in Indian cuisine. Calculate total nutritional values for this dish: ${ingredientsText}. Cooking: ${oilTsp} tsp oil, sauce: ${sauceLevel}, method: ${cookingMethod}. Return ONLY JSON: {"calories": <number>, "protein": <number>, "carbs": <number>, "fat": <number>, "fiber": <number>, "confidence": <number (0.0-1.0)>}`
        }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API responded with status: ${response.status}`);
    }

    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(text.trim());

    const result: MacroResult = {
      calories: Number(parsed.calories),
      protein: Number(parsed.protein),
      carbs: Number(parsed.carbs),
      fat: Number(parsed.fat),
      fiber: Number(parsed.fiber),
      confidence: parsed.confidence !== undefined ? Number(parsed.confidence) : 0.9,
      source: 'ai'
    };

    cache.set(cacheKey, result, 24 * 60 * 60 * 1000);
    return result;

  } catch (error) {
    console.warn('Groq Estimator failed, running fallback math:', error instanceof Error ? error.message : error);

    // Fallback math
    const oilCalories = oilTsp * FALLBACK_MODIFIERS.oilPerTsp.calories;
    const oilFat = oilTsp * FALLBACK_MODIFIERS.oilPerTsp.fat;

    let sauceCalories = 0;
    let sauceCarbs = 0;
    if (sauceLevel === 'light') {
      sauceCalories = FALLBACK_MODIFIERS.lightSauce.calories;
      sauceCarbs = FALLBACK_MODIFIERS.lightSauce.carbs;
    } else if (sauceLevel === 'medium') {
      sauceCalories = FALLBACK_MODIFIERS.mediumSauce.calories;
      sauceCarbs = FALLBACK_MODIFIERS.mediumSauce.carbs;
    } else if (sauceLevel === 'heavy') {
      sauceCalories = FALLBACK_MODIFIERS.heavySauce.calories;
      sauceCarbs = FALLBACK_MODIFIERS.heavySauce.carbs;
    }

    const baseCalories = 300;
    const baseProtein = 15;
    const baseCarbs = 35;
    const baseFat = 8;
    const baseFiber = 4;

    const result: MacroResult = {
      calories: baseCalories + oilCalories + sauceCalories,
      protein: baseProtein,
      carbs: baseCarbs + sauceCarbs,
      fat: baseFat + oilFat,
      fiber: baseFiber,
      confidence: 0.5,
      source: 'fallback'
    };

    cache.set(cacheKey, result, 24 * 60 * 60 * 1000);
    return result;
  }
}
