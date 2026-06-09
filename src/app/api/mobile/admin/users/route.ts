import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const filter: Record<string, string> = {};
    if (role) filter.role = role;

    const users = await Customer.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[Mobile Admin Users] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
