import { NextRequest, NextResponse } from 'next/server.js';
import { resolveMobileActor } from '@/lib/mobileRequestContext';
import { primaryRole, rolesOf } from '@/lib/roles';

export async function GET(request: NextRequest) {
  const r = await resolveMobileActor(request);
  if (!r.ok)
    return NextResponse.json({ error: r.error }, { status: r.status });

  const c = r.actor.customer;
  const roles = rolesOf(c);
  const plain = c.toObject ? c.toObject() : c;

  const serialized = plain ? JSON.parse(JSON.stringify(plain)) : {};
  delete serialized.quoteHistory;
  delete serialized.activeJobs;
  serialized.roles = roles;
  serialized.role = primaryRole(roles);

  return NextResponse.json({
    profile: serialized,
    role: primaryRole(roles),
    roles,
  });
}
