// CACHE BUST: 2026-04-20 00:08
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Customer } from '@/models/Customer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    await connectDB();

    const job = await Job.findOne({ trackingToken: token })
      .populate('serviceId', 'title description')
      .populate('technicianId', 'name technicianProfile currentLocation isSharingLocation');

    if (!job) {
      return NextResponse.json({ error: 'Invalid tracking token or job not found' }, { status: 404 });
    }

    // Sanitize output for public view
    const publicData = {
      id: job._id,
      status: job.status,
      service: job.serviceId?.title || 'Service',
      address: job.address,
      scheduledDate: job.scheduledDate,
      contactName: job.contactName,
      technician: job.technicianId ? {
        name: job.technicianId.name,
        photo: job.technicianId.technicianProfile?.photo,
        location: job.technicianId.isSharingLocation ? job.technicianId.currentLocation : null,
        isSharing: job.technicianId.isSharingLocation
      } : null,
      technicianNotes: job.technicianNotes,
      updatedAt: job.updatedAt
    };

    return NextResponse.json({ job: publicData });
  } catch (error: any) {
    console.error('[Public Tracking API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    await connectDB();

    const job = await Job.findOne({ trackingToken: token });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Only allow sign-off if technician has marked as completed
    if (body.status === 'signed_off') {
      if (job.status !== 'completed' && job.status !== 'in_progress') {
        return NextResponse.json({ error: 'Job must be marked as completed by technician before sign-off' }, { status: 400 });
      }

      job.status = 'signed_off';
      job.signedOffAt = new Date();
      job.signedOffBy = body.signedOffBy || 'Customer';
      job.signatureImage = body.signatureImage;
      
      await job.save();
      return NextResponse.json({ success: true, status: job.status });
    }

    return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
  } catch (error: any) {
    console.error('[Public Tracking PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update tracking status' }, { status: 500 });
  }
}
