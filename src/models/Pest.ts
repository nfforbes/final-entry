import { Schema, model, models, Document } from 'mongoose';

export type DangerLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface IPest extends Document {
  slug: string;
  commonName: string;
  scientificName: string;
  description: string;
  dangerLevel: DangerLevel;
  image: string;
  treatments: string[];
  isJamaicanNative: boolean;
  category: 'insect' | 'rodent' | 'wildlife' | 'arachnid';
  createdAt: Date;
  updatedAt: Date;
}

const PestSchema = new Schema<IPest>(
  {
    slug: { type: String, required: true, unique: true },
    commonName: { type: String, required: true },
    scientificName: { type: String },
    description: { type: String, required: true },
    dangerLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      required: true,
    },
    image: { type: String },
    treatments: [{ type: String }],
    isJamaicanNative: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['insect', 'rodent', 'wildlife', 'arachnid'],
      required: true,
    },
  },
  { timestamps: true }
);

export const Pest = models.Pest || model<IPest>('Pest', PestSchema);
