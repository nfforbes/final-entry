import { NextResponse } from 'next/server';
import { getMicrosoftTokens, getMicrosoftConfig } from '@/lib/microsoft';
import { getGoogleTokens, getGoogleConfig } from '@/lib/google';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

export async function GET(req: Request) {
    const session = await auth0.getSession(req);
    console.log(`DEBUG: Admin Settings API session for: ${session?.user?.email}, Role: ${session?.user?.role}`);
    
    // Authorization Check with DB Fallback
    let isAdmin = session?.user?.role === 'admin';
    if (!isAdmin && session?.user?.sub) {
      await connectDB();
      const user = await Customer.findOne({ auth0Id: session.user.sub });
      if (user?.role === 'admin') {
        isAdmin = true;
        console.log(`[Auth Fallback] Admin role verified via DB for ${session.user.email}`);
      }
    }

    if (!session || !session.user || !isAdmin) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: !session ? 'No session found' : `Role is ${session?.user?.role || 'missing'}`
      }, { status: 401 });
    }

  const msTokens = await getMicrosoftTokens();
  const googleTokens = await getGoogleTokens();
  const msConfig = await getMicrosoftConfig();
  const googleConfig = await getGoogleConfig();

  const maskSecret = (secret: string | undefined) => {
    if (!secret) return null;
    if (secret.length <= 8) return '********';
    return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
  };

  return NextResponse.json({
    microsoft: {
      connected: !!msTokens,
      email: msTokens?.account?.username || null,
      lastUpdated: msTokens?.expiresOn || null,
      config: msConfig ? {
        clientId: msConfig.clientId,
        tenantId: msConfig.tenantId,
        clientSecret: maskSecret(msConfig.clientSecret),
        redirectUri: msConfig.redirectUri,
      } : null,
    },
    google: {
      connected: !!googleTokens,
      email: googleTokens?.email || null,
      lastUpdated: googleTokens?.expiry_date ? new Date(googleTokens.expiry_date).toISOString() : null,
      config: googleConfig ? {
        clientId: googleConfig.clientId,
        clientSecret: maskSecret(googleConfig.clientSecret),
        redirectUri: googleConfig.redirectUri,
      } : null,
    }
  });
}
