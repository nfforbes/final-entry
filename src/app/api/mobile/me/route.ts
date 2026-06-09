import { NextRequest, NextResponse } from 'next/server.js';
import { resolveMobileActor } from '@/lib/mobileRequestContext';

export async function GET(request: NextRequest) {
  const r = await resolveMobileActor(request);
  if (!r.ok)
    return NextResponse.json({ error: r.error }, { status: r.status });

  const c = r.actor.customer;
  const plain = c.toObject ? c.toObject() : c;

  const serialized = plain ? JSON.parse(JSON.stringify(plain)) : {};
  delete serialized.quoteHistory;
  delete serialized.activeJobs;

  return NextResponse.json({
    profile: serialized,
    role: r.actor.customer.role,
  });
}
