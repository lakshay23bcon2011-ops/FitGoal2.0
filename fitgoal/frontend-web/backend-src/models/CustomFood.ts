import { Schema, model, Document, Types } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface ICustomFood extends Document {
  userId: Types.ObjectId;
  name: string;
  ingredients: IIngredient[];
  baseCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  oilTsp: number;
  sauceLevel: 'none' | 'light' | 'medium' | 'heavy';
  aiAdjusted: boolean;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }
}, { _id: false });

const CustomFoodSchema = new Schema<ICustomFood>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  ingredients: [IngredientSchema],
  baseCalories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  oilTsp: { type: Number, default: 0 },
  sauceLevel: { type: String, enum: ['none', 'light', 'medium', 'heavy'], default: 'none' },
  aiAdjusted: { type: Boolean, default: false }
});

export const CustomFood = model<ICustomFood>('CustomFood', CustomFoodSchema);
