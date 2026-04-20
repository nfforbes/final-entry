import { NextRequest, NextResponse } from 'next/server';
import { getMsalClient, getMicrosoftConfig } from '@/lib/microsoft';
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
      console.log(`[Auth Fallback] Admin role verified via DB for Microsoft Auth: ${session.user.email}`);
    }
  }

  if (!session || !session.user || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  const pca = await getMsalClient();
  const config = await getMicrosoftConfig();
  
  if (!pca || !config) {
    return NextResponse.json({ error: 'Microsoft integration is not configured. Please enter your Client ID and Secret in Settings.' }, { status: 400 });
  }

  // 2. Build the Auth URL
  const authCodeUrlParameters = {
    scopes: ['https://graph.microsoft.com/Mail.Send', 'offline_access'],
    redirectUri: config.redirectUri,
  };

  try {
    const authUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Microsoft Auth] Error generating auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate authorization URL' }, { status: 500 });
  }
}
