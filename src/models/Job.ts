import mongoose, { Schema, model, models, Document } from 'mongoose';
import { JAMAICAN_PARISHES, JamaicanParish } from './Customer';
import './Customer';
import './Service';

export type JobUrgency = 'low' | 'medium' | 'high' | 'emergency';
export type JobStatus =
  | 'rfq'
  | 'quote_sent'
  | 'order_confirmed'
  | 'assigned'
  | 'on_route'
  | 'in_progress'
  | 'signed_off'
  | 'billed'
  | 'closed'
  | 'cancelled';

export interface IJob extends Document {
  customerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  parish: JamaicanParish;
  address: string;
  pestDescription: string;
  urgency: JobUrgency;
  status: JobStatus;
  scheduledDate?: Date;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  quotedPrice?: number;
  customerNotes?: string;
  technicianNotes?: string;
  signedOffAt?: Date;
  signedOffBy?: string;
  signatureImage?: string;
  billedAt?: Date;
  closedAt?: Date;
  trackingToken?: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Customer' },
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
      enum: [
        'rfq',
        'quote_sent',
        'order_confirmed',
        'assigned',
        'on_route',
        'in_progress',
        'signed_off',
        'completed',
        'billed',
        'closed',
        'cancelled',
      ],
      default: 'rfq',
    },
    scheduledDate: { type: Date },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    quotedPrice: { type: Number },
    customerNotes: { type: String },
    technicianNotes: { type: String },
    signedOffAt: { type: Date },
    signedOffBy: { type: String },
    signatureImage: { type: String },
    billedAt: { type: Date },
    closedAt: { type: Date },
    trackingToken: { type: String, unique: true, sparse: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

// During development, clear the model from cache to ensure schema updates (like technicianId ref) are applied
if (process.env.NODE_ENV === 'development') {
  delete models.Job;
}

export const Job = models.Job || model<IJob>('Job', JobSchema);
