import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { Invitation } from '@/models/Invitation';

export type Auth0SyncInput = {
  sub: string;
  email: string;
  name?: string;
  nickname?: string;
};

/**
 * Mirrors `POST /api/users/sync`: upserts a `Customer`, applies invitations, returns a safe projection.
 */
export async function upsertCustomerFromAuth0Profile(user: Auth0SyncInput): Promise<{
  _id: unknown;
  email: string;
  role: string;
  auth0Id: string;
  name: string;
}> {
  if (!user.sub || !user.email) {
    throw new Error('sub and email are required');
  }

  await connectDB();

  let existingUser = await Customer.findOne({ auth0Id: user.sub });

  if (!existingUser) {
    existingUser = await Customer.findOne({ email: user.email });

    if (existingUser) {
      existingUser.auth0Id = user.sub;
    }
  }

  const invitation = await Invitation.findOne({
    email: user.email,
    status: 'pending',
  });

  const targetRole = (
    invitation
      ? invitation.role
      : existingUser
        ? existingUser.role
        : 'customer'
  ).toLowerCase();

  const displayName =
    user.name || user.nickname || user.email.split('@')[0];

  let updatedUser;
  if (existingUser) {
    existingUser.role = targetRole as 'customer' | 'admin' | 'technician';
    if (user.name && !existingUser.name) {
      existingUser.name = user.name;
    }
    updatedUser = await existingUser.save();
  } else {
    updatedUser = await Customer.create({
      auth0Id: user.sub,
      email: user.email,
      name: displayName,
      role: targetRole as 'customer' | 'admin' | 'technician',
      preferredTheme: 'dark',
      createdAt: new Date(),
    });
  }

  if (invitation) {
    await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });
  }

  const plain = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
  return {
    _id: plain._id,
    email: plain.email,
    role: plain.role,
    auth0Id: plain.auth0Id,
    name: plain.name,
  };
}
