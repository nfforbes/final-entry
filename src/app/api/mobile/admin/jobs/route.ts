import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Job as JobModel } from '@/models/Job';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const r = await resolveMobileActor(request);
  if (!r.ok)
    return NextResponse.json({ error: r.error }, { status: r.status });

  if (!requireRoles(r.actor, ['admin'])) {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  }

  await connectDB();
  const jobs = await JobModel.find({})
    .populate('customerId', 'name email')
    .populate('serviceId', 'title')
    .populate('technicianId', 'name')
    .sort({ createdAt: -1 });

  return NextResponse.json({ jobs });
}
