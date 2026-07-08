export interface SetData {
  reps?: number;
  weight?: number; // kg
  rpe?: number; // 1-10
  duration?: number; // seconds (for cardio)
  heartRate?: number;
}

export interface UserProfile {
  weight: number; // kg
  age: number;
  gender: 'male' | 'female' | 'other';
  restingHeartRate?: number;
}

export function calculateStrengthBurn(sets: SetData[], user: UserProfile): number {
  const genderMultiplier = user.gender === 'male' ? 1.0 : user.gender === 'female' ? 0.85 : 0.90;
  const ageMultiplier = user.age < 30 ? 1.05 : user.age > 50 ? 0.90 : 1.0;

  let totalBurn = 0;
  for (const set of sets) {
    if (!set.reps || !set.weight || !set.rpe) continue;
    const volume = set.reps * set.weight;
    const burn = volume * 0.01 * (user.weight / 70) * (set.rpe / 5) * genderMultiplier * ageMultiplier;
    totalBurn += burn;
  }
  return Math.round(totalBurn * 100) / 100;
}

export function calculateCardioBurn(
  met: number,
  durationMinutes: number,
  userWeightKg: number,
  heartRate?: number,
  restingHR?: number
): number {
  if (heartRate) {
    const hrRest = restingHR || 70; // fallback default resting heart rate
    const hrr = Math.max(0, heartRate - hrRest);
    // Karvonen formula: ((hrr / 100) * 3.5 * weight * duration) / 200
    const burn = ((hrr / 100) * 3.5 * userWeightKg * durationMinutes) / 200;
    return Math.round(burn * 100) / 100;
  }

  // Standard MET formula: (met * weight * duration) / 60
  const burn = (met * userWeightKg * durationMinutes) / 60;
  return Math.round(burn * 100) / 100;
}
