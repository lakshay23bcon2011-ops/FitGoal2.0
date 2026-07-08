import { Schema, model, Document, Types } from 'mongoose';

export interface ISmoothie extends Document {
  userId: Types.ObjectId;
  name: string;
  base: string;
  sizeml: number;
  toppings: string[];
  calories: number;
  protein: number;
}

const SmoothieSchema = new Schema<ISmoothie>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  base: { type: String, required: true },
  sizeml: { type: Number, required: true },
  toppings: [{ type: String }],
  calories: { type: Number, required: true },
  protein: { type: Number, required: true }
});

export const Smoothie = model<ISmoothie>('Smoothie', SmoothieSchema);
