// models/counter.model.ts
import mongoose, { Schema, Model } from "mongoose";

interface CounterDocument {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<CounterDocument>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter: Model<CounterDocument> =
  mongoose.models.Counter ||
  mongoose.model<CounterDocument>("Counter", CounterSchema);

export default Counter;
