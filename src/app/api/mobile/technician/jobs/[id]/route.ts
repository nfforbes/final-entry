import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await connectDB();

    const job = await Job.findById(id)
      .populate('customerId', 'name email address phone')
      .populate('serviceId', 'title description documentation');

    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (job.technicianId?.toString() !== r.actor.customer._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden. This job is not assigned to you.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, job });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status, technicianNotes } = body;

    if (
      status &&
      !['assigned', 'on_route', 'in_progress', 'completed', 'cancelled'].includes(
        status
      )
    ) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    const job = await Job.findById(id);
    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (job.technicianId?.toString() !== r.actor.customer._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden. This job is not assigned to you.' },
        { status: 403 }
      );
    }

    if (status) {
      job.status = status;
      if (status === 'completed') job.completedAt = new Date();
    }

    if (technicianNotes !== undefined) job.technicianNotes = technicianNotes;

    await job.save();

    return NextResponse.json({ success: true, job });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
