import mongoose, { Schema, model, models, Document } from 'mongoose';

export const JAMAICAN_PARISHES = [
  'Kingston',
  'Saint Andrew',
  'Saint Thomas',
  'Portland',
  'Saint Mary',
  'Saint Ann',
  'Trelawny',
  'Saint James',
  'Hanover',
  'Westmoreland',
  'Saint Elizabeth',
  'Manchester',
  'Clarendon',
  'Saint Catherine',
] as const;

export type JamaicanParish = typeof JAMAICAN_PARISHES[number];

export interface ICustomer extends Document {
  auth0Id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  parish?: JamaicanParish;
  role: 'customer' | 'admin';
  quoteHistory: mongoose.Types.ObjectId[];
  preferredTheme: 'dark' | 'light';
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  isSharingLocation: boolean;
  technicianProfile?: {
    certifications: string[];
    yearsExperience: number;
    bio?: string;
    photo?: string;
  };
  activeJobs: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    parish: { type: String, enum: JAMAICAN_PARISHES },
    role: { type: String, enum: ['customer', 'admin', 'technician'], default: 'customer' },
    quoteHistory: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    preferredTheme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date }
    },
    isSharingLocation: { type: Boolean, default: false },
    technicianProfile: {
      certifications: [{ type: String }],
      yearsExperience: { type: Number, default: 0 },
      bio: { type: String },
      photo: { type: String }
    },
    activeJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete models.Customer;
}

export const Customer = models.Customer || model<ICustomer>('Customer', CustomerSchema);
