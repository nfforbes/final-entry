import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Technician } from '@/models/Technician';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const { jobId } = await req.json();

    const [technician, job] = await Promise.all([
      Technician.findById(id),
      Job.findById(jobId),
    ]);

    if (!technician || !job) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Assign technician to job
    job.technicianId = technician._id;
    job.status = 'assigned';

    // Add job to technician's active list
    if (!technician.activeJobs.includes(jobId)) {
      technician.activeJobs.push(jobId);
    }

    await Promise.all([job.save(), technician.save()]);

    return NextResponse.json({ job, technician });
  } catch {
    return NextResponse.json({ error: 'Assignment failed' }, { status: 500 });
  }
}
