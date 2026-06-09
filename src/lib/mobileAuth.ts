import { createRemoteJWKSet, decodeJwt, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest } from 'next/server.js';

/** Native Android client id — must match `AuthManager.kt` / Auth0 Native application. */
export const AUTH0_MOBILE_CLIENT_ID_DEFAULT = 'VrzhxH5mE9gclkKHG5QOLhPivXFa1xNz';

/** Normalizes Auth0 issuer URL (issuer claim format). */
export function getAuth0Issuer(): string {
  const raw =
    process.env.AUTH0_DOMAIN?.replace(/^https?:\/\//i, '').replace(/\/+$/, '') ||
    '';
  if (!raw) throw new Error('AUTH0_DOMAIN is required for mobile JWT verification');
  return `https://${raw}/`;
}

function audienceClaimValues(aud: unknown): string[] {
  if (typeof aud === 'string') return [aud];
  if (Array.isArray(aud)) return aud.map(String);
  return [];
}

/** All audiences accepted for mobile bearer JWTs (access or id tokens). */
export function getAuth0AudienceList(): string[] {
  const extraRaw = [
    process.env.AUTH0_AUDIENCE,
    process.env.AUTH0_MOBILE_AUDIENCE,
  ]
    .filter(Boolean)
    .join(',');
  const list = extraRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const webClientId = process.env.AUTH0_CLIENT_ID?.trim();
  const mobileClientId =
    process.env.AUTH0_MOBILE_CLIENT_ID?.trim() ?? AUTH0_MOBILE_CLIENT_ID_DEFAULT;
  const userinfoAud = new URL('userinfo', getAuth0Issuer()).href;

  const merged = [
    ...list,
    webClientId,
    mobileClientId,
    userinfoAud,
  ].filter((v): v is string => Boolean(v));

  const unique = [...new Set(merged)];
  if (unique.length === 0) {
    throw new Error(
      'Set AUTH0_AUDIENCE, AUTH0_MOBILE_AUDIENCE, AUTH0_CLIENT_ID, or AUTH0_MOBILE_CLIENT_ID'
    );
  }
  return unique;
}

/** @deprecated Use getAuth0AudienceList — kept for callers expecting string | string[]. */
export function getAuth0Audiences(): string | string[] {
  const audiences = getAuth0AudienceList();
  return audiences.length === 1 ? audiences[0]! : audiences;
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

/** Verifies Auth0 access or id tokens presented as mobile bearer credentials. */
export async function verifyAuth0BearerToken(token: string): Promise<JWTPayload> {
  const issuer = getAuth0Issuer();
  const allowed = getAuth0AudienceList();

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer,
      audience: allowed.length === 1 ? allowed[0]! : allowed,
      clockTolerance: 30,
    });
    return payload;
  } catch (primary) {
    if (primary instanceof Error && /compact JWS/i.test(primary.message)) {
      throw new Error(
        `${primary.message} (token is not a JWT — sign out and log in again)`
      );
    }

    // Auth0 id tokens: validate signature + issuer, then check aud manually.
    try {
      const { payload } = await jwtVerify(token, getJwks(), {
        issuer,
        clockTolerance: 30,
      });
      const tokenAud = audienceClaimValues(payload.aud);
      if (!tokenAud.some((a) => allowed.includes(a))) {
        throw new Error(
          `JWT audience mismatch: token aud=[${tokenAud.join(', ')}], allowed=[${allowed.join(', ')}]`
        );
      }
      return payload;
    } catch (secondary) {
      if (
        secondary instanceof Error &&
        (secondary.message.includes('audience mismatch') ||
          secondary.message.includes('expired'))
      ) {
        throw secondary;
      }
      let audHint = '';
      try {
        const decoded = decodeJwt(token);
        audHint = ` (token aud=[${audienceClaimValues(decoded.aud).join(', ')}], iss=${String(decoded.iss ?? '?')})`;
      } catch {
        /* ignore decode errors */
      }
      const msg =
        primary instanceof Error ? primary.message : 'JWT verification failed';
      throw new Error(`${msg}${audHint}`);
    }
  }
}

/** @deprecated Alias for verifyAuth0BearerToken */
export async function verifyAuth0AccessToken(token: string): Promise<JWTPayload> {
  return verifyAuth0BearerToken(token);
}

/** Fetches profile claims when the access token JWT omits `email`. */
export async function fetchAuth0UserInfo(
  accessToken: string
): Promise<{ sub?: string; email?: string; name?: string; nickname?: string }> {
  const res = await fetch(new URL('userinfo', getAuth0Issuer()), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Auth0 userinfo failed (${res.status})`);
  }
  return (await res.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    nickname?: string;
  };
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
