import { Schema, model, models, Document } from 'mongoose';
import { JAMAICAN_PARISHES, JamaicanParish } from './Customer';

export interface ITechnician extends Document {
  name: string;
  email: string;
  phone: string;
  parishes: JamaicanParish[];
  isAvailable: boolean;
  activeQuotes: Schema.Types.ObjectId[];
  photo?: string;
  bio?: string;
  yearsExperience: number;
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    parishes: [{ type: String, enum: JAMAICAN_PARISHES }],
    isAvailable: { type: Boolean, default: true },
    activeQuotes: [{ type: Schema.Types.ObjectId, ref: 'Quote' }],
    photo: { type: String },
    bio: { type: String },
    yearsExperience: { type: Number, default: 0 },
    certifications: [{ type: String }],
  },
  { timestamps: true }
);

export const Technician =
  models.Technician || model<ITechnician>('Technician', TechnicianSchema);
