export interface PlanRequest {
  goal: 'bulk' | 'cut' | 'maintain';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  timePerSession: number; // minutes
  equipment: string[];
}

export async function generateWorkoutPlan(req: PlanRequest): Promise<string> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      throw new Error('No Groq API key configuration found. Running fallback.');
    }

    const prompt = `Create a ${req.daysPerWeek}-day workout plan for a user with fitness experience level: ${req.experience} and goal: ${req.goal}. 
Time per session: ${req.timePerSession} minutes. 
Available equipment: ${req.equipment.join(', ')}. 
Return a structured JSON workout plan containing exercises, sets, reps, and rest periods. Ensure output is valid JSON and contains no conversational text outside the JSON.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API responded with status: ${response.status}`);
    }

    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || '';
    return text.trim();

  } catch (error) {
    console.warn('aiService generateWorkoutPlan failed, returning static fallback plan:', error instanceof Error ? error.message : error);

    const fallbackPlan = {
      planName: `Fallback ${req.daysPerWeek}-Day ${req.experience} ${req.goal} Plan`,
      days: Array.from({ length: req.daysPerWeek }, (_, i) => ({
        day: i + 1,
        focus: i % 2 === 0 ? 'Upper Body Push & Pull' : 'Lower Body & Core',
        exercises: i % 2 === 0 ? [
          { name: 'Push-Ups', sets: 3, reps: '10-15', rest: '60s' },
          { name: 'Dumbbell Rows (or Bodyweight Rows)', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12', rest: '60s' }
        ] : [
          { name: 'Bodyweight Squats (or Goblet Squats)', sets: 3, reps: '15', rest: '60s' },
          { name: 'Romanian Deadlifts (Dumbbell)', sets: 3, reps: '12', rest: '60s' },
          { name: 'Plank', sets: 3, reps: '45 seconds', rest: '45s' }
        ]
      }))
    };

    return JSON.stringify(fallbackPlan, null, 2);
  }
}

export async function analyzePerformance(
  exerciseName: string,
  currentLog: object,
  previousLog: object
): Promise<string> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      throw new Error('No Groq API key configuration found. Running fallback.');
    }

    const prompt = `Analyze performance progression for ${exerciseName}.
Previous session: ${JSON.stringify(previousLog)}
Current session: ${JSON.stringify(currentLog)}
Give specific, actionable feedback on load progression, volume, and form cues. Keep it under 100 words.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API responded with status: ${response.status}`);
    }

    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || '';
    return text.trim();

  } catch (error) {
    console.warn('aiService analyzePerformance failed, returning fallback feedback:', error instanceof Error ? error.message : error);
    return `Fallback Feedback: Great job completing your sets for ${exerciseName}! Based on your current volume of ${JSON.stringify(currentLog)}, you should aim to gradually increase the load by 2.5kg or perform 1-2 additional repetitions in your next workout, keeping form strict and focus high. Keep pushing!`;
  }
}
