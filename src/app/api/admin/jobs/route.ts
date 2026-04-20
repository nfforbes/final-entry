import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job as JobModel } from '@/models/Job';
import { Customer } from '@/models/Customer';
import { Service } from '@/models/Service';
import { auth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Direct DB role check
    const currentUser = await Customer.findOne({ auth0Id: session.user.sub });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const jobs = await JobModel.find({})
      .populate('customerId', 'name email')
      .populate('serviceId', 'title')
      .populate('technicianId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('[Admin Jobs API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch jobs',
      details: error.message
    }, { status: 500 });
  }
}
