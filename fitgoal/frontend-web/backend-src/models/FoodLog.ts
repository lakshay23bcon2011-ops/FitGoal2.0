import { Schema, model, Document, Types } from 'mongoose';

export interface IFoodLog extends Document {
  userId: Types.ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'pre_workout' | 'post_workout';
  foodType: 'indian_food' | 'custom_food' | 'smoothie' | 'manual';
  foodId?: Types.ObjectId;
  foodName: string;
  quantity: number;
  unit: 'grams' | 'ml' | 'pieces' | 'servings';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  oilLevel: number;
  spiceLevel?: 'none' | 'low' | 'medium' | 'high';
  aiAdjusted: boolean;
}

const FoodLogSchema = new Schema<IFoodLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'pre_workout', 'post_workout'], 
    required: true 
  },
  foodType: { 
    type: String, 
    enum: ['indian_food', 'custom_food', 'smoothie', 'manual'], 
    required: true 
  },
  foodId: { type: Schema.Types.ObjectId },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['grams', 'ml', 'pieces', 'servings'], required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  fiber: { type: Number, required: true },
  oilLevel: { type: Number, default: 0 },
  spiceLevel: { type: String, enum: ['none', 'low', 'medium', 'high'] },
  aiAdjusted: { type: Boolean, default: false }
});

export const FoodLog = model<IFoodLog>('FoodLog', FoodLogSchema);
