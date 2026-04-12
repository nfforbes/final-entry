import { Schema, model, models, Document } from 'mongoose';

export interface IService extends Document {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  priceRange: { min: number; max: number };
  icon: string;
  image: string;
  features: string[];
  pestTypes: string[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    icon: { type: String, required: true },
    image: { type: String },
    features: [{ type: String }],
    pestTypes: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = models.Service || model<IService>('Service', ServiceSchema);
