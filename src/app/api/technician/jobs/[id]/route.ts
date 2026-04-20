import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Customer } from '@/models/Customer';
import { auth0 } from '@/lib/auth0';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Find technician user
    const user = await Customer.findOne({ auth0Id: session.user.sub });
    if (!user || user.role !== 'technician') {
      return NextResponse.json({ error: 'Forbidden. Technician access required.' }, { status: 403 });
    }

    const job = await Job.findById(id)
      .populate('customerId', 'name email address phone')
      .populate('serviceId', 'title description documentation');

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Security: Verify ownership
    if (job.technicianId?.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden. This job is not assigned to you.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error('[Technician Job Details API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status, technicianNotes } = await request.json();

    if (status && !['assigned', 'on_route', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    // Find technician user
    const user = await Customer.findOne({ auth0Id: session.user.sub });
    if (!user || user.role !== 'technician') {
      return NextResponse.json({ error: 'Forbidden. Technician access required.' }, { status: 403 });
    }

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Security: Verify ownership
    if (job.technicianId?.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden. This job is not assigned to you.' }, { status: 403 });
    }

    if (status) {
      job.status = status;
      if (status === 'completed') {
        job.completedAt = new Date();
      }
    }

    if (technicianNotes !== undefined) {
      job.technicianNotes = technicianNotes;
    }

    await job.save();

    console.log(`[Job Update] Job ${id} status updated to ${status} by driver ${user.name}`);

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error('[Technician Job Update API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
