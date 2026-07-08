import { Schema, model, Document, Types } from 'mongoose';

export interface IWaterLog extends Document {
  userId: Types.ObjectId;
  date: Date;
  amount: number; // ml
  timestamp: Date;
}

const WaterLogSchema = new Schema<IWaterLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now }
});

export const WaterLog = model<IWaterLog>('WaterLog', WaterLogSchema);
