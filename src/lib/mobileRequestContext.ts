import { NextRequest } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import type { ICustomer } from '@/models/Customer';
import type { HydratedDocument } from 'mongoose';
import {
  claimsToMobileUser,
  extractBearerToken,
  verifyAuth0AccessToken,
} from '@/lib/mobileAuth';
import { upsertCustomerFromAuth0Profile } from '@/lib/auth0SyncUser';

export type MobileActor = {
  customer: HydratedDocument<ICustomer>;
  bearerSub: string;
};

/**
 * Bearer Auth0 JWT + upsert/sync into MongoDB (matches Auth0 callback sync rules).
 */
export async function resolveMobileActor(
  request: NextRequest
): Promise<{ ok: false; status: number; error: string } | { ok: true; actor: MobileActor }> {
  const raw = extractBearerToken(request);
  if (!raw) return { ok: false, status: 401, error: 'Missing Authorization Bearer token' };

  try {
    const payload = await verifyAuth0AccessToken(raw);
    const u = claimsToMobileUser(payload);
    if (!u.sub) return { ok: false, status: 401, error: 'Token missing sub' };

    await connectDB();
    let doc = await Customer.findOne({ auth0Id: u.sub });
    if (!doc && u.email) doc = await Customer.findOne({ email: u.email });

    if (!doc) {
      if (!u.email) {
        return {
          ok: false,
          status: 403,
          error:
            'No local profile yet. Authenticate with an access token that includes the `email` claim (openid profile email) or complete one web login to sync.',
        };
      }
      const synced = await upsertCustomerFromAuth0Profile({
        sub: u.sub,
        email: u.email,
        name: u.name,
        nickname: typeof payload.nickname === 'string' ? payload.nickname : undefined,
      });
      doc = await Customer.findById(synced._id);
    } else if (doc.auth0Id !== u.sub) {
      doc.auth0Id = u.sub;
      if (u.name && !doc.name) doc.name = u.name;
      await doc.save();
    }

    if (!doc) {
      return { ok: false, status: 500, error: 'User sync inconsistent' };
    }

    return { ok: true, actor: { customer: doc, bearerSub: u.sub } };
  } catch (e) {
    console.warn(
      '[resolveMobileActor]',
      e instanceof Error ? e.message : e
    );
    return { ok: false, status: 401, error: 'Invalid or expired access token' };
  }
}

export function requireRoles(
  actor: MobileActor,
  roles: Array<ICustomer['role']>
): boolean {
  return roles.includes(actor.customer.role as ICustomer['role']);
}
