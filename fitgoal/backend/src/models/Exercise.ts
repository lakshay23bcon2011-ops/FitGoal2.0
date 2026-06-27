import { Schema, model, Document } from 'mongoose';

export interface IExercise extends Document {
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'yoga' | 'hiit';
  muscleGroups: string[];
  equipment: string[];
  met: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  isCompound: boolean;
}

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true, unique: true, trim: true },
  category: { 
    type: String, 
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'yoga', 'hiit'], 
    required: true 
  },
  muscleGroups: [{ type: String }],
  equipment: [{ type: String }],
  met: { type: Number, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  instructions: [{ type: String }],
  isCompound: { type: Boolean, default: false }
});

export const Exercise = model<IExercise>('Exercise', ExerciseSchema);
