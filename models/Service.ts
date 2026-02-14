import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  price: number;
  duration: number;
  category: string;
  description: string;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
