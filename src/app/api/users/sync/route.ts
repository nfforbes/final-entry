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

    console.log(`[Sync Route] Synchronizing user: ${user.email}`);
    await connectDB();

    // Check for pending invitations
    const invitation = await Invitation.findOne({ 
      email: user.email, 
      status: 'pending' 
    });

    const targetRole = invitation ? invitation.role : 'customer';

    const updatedUser = await Customer.findOneAndUpdate(
      { auth0Id: user.sub },
      {
        $setOnInsert: {
          auth0Id: user.sub,
          email: user.email,
          name: user.name || user.nickname || user.email,
          role: targetRole,
          preferredTheme: 'dark',
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // If there was an invitation, mark it as accepted
    if (invitation) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });
      console.log(`[Sync Route] Applied invitation role '${targetRole}' to ${user.email}`);
    }

    console.log(`[Sync Route] Successfully synced user: ${updatedUser.email}`);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[Sync Route] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
