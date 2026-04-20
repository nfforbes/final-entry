import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Customer } from '@/models/Customer';
import { auth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the technician user in our DB
    const user = await Customer.findOne({ auth0Id: session.user.sub });
    if (!user || user.role !== 'technician') {
      return NextResponse.json({ error: 'Forbidden. Technician access required.' }, { status: 403 });
    }

    // Fetch jobs assigned to this technician
    const jobs = await Job.find({ technicianId: user._id })
      .populate('customerId', 'name address')
      .populate('serviceId', 'title description')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error('[Technician Jobs API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
