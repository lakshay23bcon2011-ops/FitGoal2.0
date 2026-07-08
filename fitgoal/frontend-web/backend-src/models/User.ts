import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female' | 'other';
  goal: 'bulk' | 'cut' | 'maintain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  targetCalories: number;
  targetProtein: number; // g
  targetCarbs: number; // g
  targetFat: number; // g
  targetWater: number; // ml
  googleId?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  goal: { type: String, enum: ['bulk', 'cut', 'maintain'] },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
  targetCalories: { type: Number },
  targetProtein: { type: Number },
  targetCarbs: { type: Number },
  targetFat: { type: Number },
  targetWater: { type: Number },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = model<IUser>('User', UserSchema);
