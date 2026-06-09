import { NextRequest, NextResponse } from 'next/server.js';
import { getMicrosoftTokens, getMicrosoftConfig } from '@/lib/microsoft';
import { getGoogleTokens, getGoogleConfig } from '@/lib/google';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

const maskSecret = (secret: string | undefined) => {
  if (!secret) return null;
  if (secret.length <= 8) return '********';
  return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
};

export async function GET(request: NextRequest) {
  const r = await resolveMobileActor(request);
  if (!r.ok)
    return NextResponse.json({ error: r.error }, { status: r.status });

  if (!requireRoles(r.actor, ['admin'])) {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  }

  const msTokens = await getMicrosoftTokens();
  const googleTokens = await getGoogleTokens();
  const msConfig = await getMicrosoftConfig();
  const googleConfig = await getGoogleConfig();

  const appBase =
    process.env.APP_BASE_URL ||
    process.env.AUTH0_BASE_URL ||
    '';

  return NextResponse.json({
    connectUrls: appBase
      ? {
          googleAuth: `${appBase}/api/admin/google/auth`,
          microsoftAuth: `${appBase}/api/admin/microsoft/auth`,
        }
      : null,
    microsoft: {
      connected: !!msTokens,
      email: msTokens?.account?.username ?? null,
      lastUpdated: msTokens?.expiresOn ?? null,
      config: msConfig
        ? {
            clientId: msConfig.clientId,
            tenantId: msConfig.tenantId,
            clientSecret: maskSecret(msConfig.clientSecret),
            redirectUri: msConfig.redirectUri,
          }
        : null,
    },
    google: {
      connected: !!googleTokens,
      email: googleTokens?.email ?? null,
      lastUpdated: googleTokens?.expiry_date
        ? new Date(googleTokens.expiry_date).toISOString()
        : null,
      config: googleConfig
        ? {
            clientId: googleConfig.clientId,
            clientSecret: maskSecret(googleConfig.clientSecret),
            redirectUri: googleConfig.redirectUri,
          }
        : null,
    },
  });
}
