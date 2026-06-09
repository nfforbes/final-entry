import { NextRequest, NextResponse } from 'next/server.js';
import { executeAdminJobPatch } from '@/lib/jobs/adminJobPatch';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const r = await resolveMobileActor(request);
    if (!r.ok)
      return NextResponse.json({ error: r.error }, { status: r.status });

    if (!requireRoles(r.actor, ['admin'])) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = await executeAdminJobPatch(r.actor.customer, id, body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ job: result.job });
  } catch {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
