import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const r = await resolveMobileActor(request);
    if (!r.ok)
      return NextResponse.json({ error: r.error }, { status: r.status });

    if (!requireRoles(r.actor, ['technician'])) {
      return NextResponse.json(
        { error: 'Technician role required' },
        { status: 403 }
      );
    }

    await connectDB();

    const jobs = await Job.find({ technicianId: r.actor.customer._id })
      .populate('customerId', 'name address phone')
      .populate('serviceId', 'title description')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, jobs });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
