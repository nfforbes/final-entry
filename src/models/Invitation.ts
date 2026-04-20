import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  role: 'customer' | 'admin' | 'technician';
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string; // auth0Id of the admin
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, index: true },
    role: { type: String, enum: ['customer', 'admin', 'technician'], required: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    invitedBy: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Indexes
InvitationSchema.index({ email: 1, status: 1 });
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatic cleanup after expiry

export const Invitation = models.Invitation || model<IInvitation>('Invitation', InvitationSchema);
