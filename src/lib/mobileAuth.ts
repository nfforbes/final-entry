import { createRemoteJWKSet, jwtVerify, decodeJwt, type JWTPayload } from 'jose';
import { NextRequest } from 'next/server.js';

/** Normalizes Auth0 issuer URL (issuer claim format). */
export function getAuth0Issuer(): string {
  const raw =
    process.env.AUTH0_DOMAIN?.replace(/^https?:\/\//i, '').replace(/\/+$/, '') ||
    '';
  if (!raw) throw new Error('AUTH0_DOMAIN is required for mobile JWT verification');
  return `https://${raw}/`;
}

/** Audiences validated on access tokens (`AUTH0_AUDIENCE`, optional `AUTH0_MOBILE_AUDIENCE`, fallback `AUTH0_CLIENT_ID`). */
export function getAuth0Audiences(): string | string[] {
  const extraRaw =
    process.env.AUTH0_AUDIENCE ??
    process.env.AUTH0_MOBILE_AUDIENCE ??
    '';
  const list = extraRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const clientId = process.env.AUTH0_CLIENT_ID?.trim();
  const merged =
    clientId && !list.includes(clientId)
      ? [...list, clientId]
      : list.length > 0
        ? [...list]
        : clientId
          ? [clientId]
          : [];
  if (merged.length === 0) {
    throw new Error(
      'Set AUTH0_AUDIENCE, AUTH0_MOBILE_AUDIENCE, or AUTH0_CLIENT_ID so mobile tokens can be verified'
    );
  }
  return merged.length === 1 ? merged[0]! : merged;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL('.well-known/jwks.json', getAuth0Issuer()));
  }
  return jwks;
}

export function extractBearerToken(request: NextRequest): string | null {
  const h = request.headers.get('authorization');
  if (!h?.toLowerCase().startsWith('bearer ')) return null;
  return h.slice(7).trim() || null;
}

export async function verifyAuth0AccessToken(
  accessToken: string
): Promise<JWTPayload> {
  const decoded = decodeJwt(accessToken);
  console.log('[verifyAuth0AccessToken] Decoded token payload:', decoded);
  console.log('[verifyAuth0AccessToken] Expected audiences:', getAuth0Audiences());
  
  const { payload } = await jwtVerify(accessToken, getJwks(), {
    issuer: getAuth0Issuer(),
    audience: getAuth0Audiences(),
  });
  return payload;
}

export type MobileJwtUser = {
  sub: string;
  email?: string;
  name?: string;
};

export function claimsToMobileUser(payload: JWTPayload): MobileJwtUser {
  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const email =
    typeof payload.email === 'string'
      ? payload.email
      : typeof (payload as { [k: string]: unknown })['email'] === 'string'
        ? ((payload as { email: string }).email)
        : undefined;
  const name =
    typeof payload.name === 'string'
      ? payload.name
      : typeof payload.nickname === 'string'
        ? payload.nickname
        : undefined;
  return { sub, email, name };
}
