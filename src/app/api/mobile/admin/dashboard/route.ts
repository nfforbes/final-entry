import { NextRequest, NextResponse } from 'next/server.js';
import { computeAdminDashboardStats } from '@/lib/adminDashboardStats';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

export async function GET(request: NextRequest) {
  try {
    const r = await resolveMobileActor(request);
    if (!r.ok)
      return NextResponse.json({ error: r.error }, { status: r.status });

    if (!requireRoles(r.actor, ['admin'])) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const { stats } = await computeAdminDashboardStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[Mobile Dashboard] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
