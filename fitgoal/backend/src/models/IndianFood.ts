import { Schema, model, Document } from 'mongoose';

export interface IIndianFood extends Document {
  name: string;
  nameHindi?: string;
  category: 'north' | 'south' | 'east' | 'west' | 'street_food' | 'sweets' | 'beverages' | 'snacks' | 'rice' | 'breads' | 'dal' | 'sabzi';
  servingSize: number; // grams
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  isVegetarian: boolean;
  isVegan: boolean;
  isJain: boolean;
  tags: string[];
}

const IndianFoodSchema = new Schema<IIndianFood>({
  name: { type: String, required: true, trim: true },
  nameHindi: { type: String, trim: true },
  category: { 
    type: String, 
    enum: ['north', 'south', 'east', 'west', 'street_food', 'sweets', 'beverages', 'snacks', 'rice', 'breads', 'dal', 'sabzi'], 
    required: true 
  },
  servingSize: { type: Number, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  fiber: { type: Number, required: true },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isJain: { type: Boolean, default: false },
  tags: [{ type: String }]
});

export const IndianFood = model<IIndianFood>('IndianFood', IndianFoodSchema);
