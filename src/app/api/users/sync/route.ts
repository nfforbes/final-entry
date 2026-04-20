import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { Invitation } from '@/models/Invitation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { user, secret } = await request.json();

    // Validate sync secret
    if (secret !== process.env.INTERNAL_SYNC_SECRET) {
      console.error('[Sync Route] Unauthorized sync attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user || !user.sub || !user.email) {
      return NextResponse.json({ error: 'Missing user data' }, { status: 400 });
    }

    console.log(`[Sync Route] Synchronizing user: ${user.email} (sub: ${user.sub})`);
    await connectDB();

    // 1. Try to find user by auth0Id
    let existingUser = await Customer.findOne({ auth0Id: user.sub });
    
    // 2. If not found by auth0Id, try to find by email
    if (!existingUser) {
      console.log(`[Sync Route] User not found by ID, checking by email: ${user.email}`);
      existingUser = await Customer.findOne({ email: user.email });
      
      if (existingUser) {
        console.log(`[Sync Route] Found existing user by email, linking Auth0 ID.`);
        existingUser.auth0Id = user.sub;
      }
    }

    // Check for pending invitations
    const invitation = await Invitation.findOne({ 
      email: user.email, 
      status: 'pending' 
    });

    const targetRole = (invitation ? invitation.role : (existingUser ? existingUser.role : 'customer')).toLowerCase();

    let updatedUser;
    if (existingUser) {
      // Update existing user
      existingUser.role = targetRole;
      // Sync names if they are different and we have a new name
      if (user.name && !existingUser.name) {
        existingUser.name = user.name;
      }
      updatedUser = await existingUser.save();
    } else {
      // Create new user
      updatedUser = await Customer.create({
        auth0Id: user.sub,
        email: user.email,
        name: user.name || user.nickname || user.email,
        role: targetRole,
        preferredTheme: 'dark',
        createdAt: new Date(),
      });
    }

    // If there was an invitation, mark it as accepted
    if (invitation) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });
      console.log(`[Sync Route] Applied invitation role '${targetRole}' to ${user.email}`);
    }

    const userToReturn = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
    console.log(`[Sync Route] Successfully synced user: ${userToReturn.email} with role: ${userToReturn.role}`);
    
    return NextResponse.json({ 
      success: true, 
      user: {
        _id: userToReturn._id,
        email: userToReturn.email,
        role: userToReturn.role,
        auth0Id: userToReturn.auth0Id,
        name: userToReturn.name
      } 
    });
  } catch (error) {
    console.error('[Sync Route] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
