import { NextRequest, NextResponse } from 'next/server';
import { getOauth2Client } from '@/lib/google';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

export async function GET(req: NextRequest) {
  // 1. Check if user is logged in and is an Admin
  const session = await auth0.getSession(req);
  
  // Authorization Check with DB Fallback
  let isAdmin = session?.user?.role === 'admin';
  if (!isAdmin && session?.user?.sub) {
    await connectDB();
    const user = await Customer.findOne({ auth0Id: session.user.sub });
    if (user?.role === 'admin') {
      isAdmin = true;
      console.log(`[Auth Fallback] Admin role verified via DB for Google Auth: ${session.user.email}`);
    }
  }

  if (!session || !session.user || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  const client = await getOauth2Client();
  if (!client) {
    return NextResponse.json({ error: 'Google integration is not configured. Please enter your Client ID and Secret in Settings.' }, { status: 400 });
  }

  // 2. Build the Auth URL
  const authUrl = client.generateAuthUrl({
    access_type: 'offline', // Required for refresh tokens
    prompt: 'consent',     // Force consent to always get a refresh token
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });

  try {
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Google Auth] Error generating auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate authorization URL' }, { status: 500 });
  }
}
