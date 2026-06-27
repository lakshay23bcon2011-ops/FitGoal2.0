import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkoutSet {
  reps?: number;
  weight?: number; // kg
  rpe?: number; // 1–10
  duration?: number; // seconds (cardio)
  heartRate?: number;
}

export interface IWorkoutLogExercise {
  exerciseId: Types.ObjectId;
  sets: IWorkoutSet[];
}

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  date: Date;
  sessionName: string;
  exercises: IWorkoutLogExercise[];
  totalCaloriesBurned: number;
  duration: number; // minutes
  mood?: 'terrible' | 'bad' | 'okay' | 'good' | 'great';
}

const WorkoutSetSchema = new Schema<IWorkoutSet>({
  reps: { type: Number },
  weight: { type: Number },
  rpe: { type: Number },
  duration: { type: Number },
  heartRate: { type: Number }
}, { _id: false });

const WorkoutLogExerciseSchema = new Schema<IWorkoutLogExercise>({
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
  sets: [WorkoutSetSchema]
}, { _id: false });

const WorkoutLogSchema = new Schema<IWorkoutLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  sessionName: { type: String, required: true, trim: true },
  exercises: [WorkoutLogExerciseSchema],
  totalCaloriesBurned: { type: Number, required: true, default: 0 },
  duration: { type: Number, required: true },
  mood: { type: String, enum: ['terrible', 'bad', 'okay', 'good', 'great'] }
});

export const WorkoutLog = model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
