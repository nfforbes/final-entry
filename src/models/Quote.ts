import mongoose, { Schema, model, models, Document } from 'mongoose';
import { JAMAICAN_PARISHES, JamaicanParish } from './Customer';

export type QuoteUrgency = 'low' | 'medium' | 'high' | 'emergency';
export type QuoteStatus =
  | 'pending'
  | 'contacted'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export interface IQuote extends Document {
  customerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  parish: JamaicanParish;
  address: string;
  pestDescription: string;
  urgency: QuoteUrgency;
  status: QuoteStatus;
  scheduledDate?: Date;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  technicianNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Technician' },
    parish: { type: String, enum: JAMAICAN_PARISHES, required: true },
    address: { type: String, required: true },
    pestDescription: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledDate: { type: Date },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    technicianNotes: { type: String },
  },
  { timestamps: true }
);

export const Quote = models.Quote || model<IQuote>('Quote', QuoteSchema);
