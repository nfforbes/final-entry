import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { computeAdminDashboardStats } from '@/lib/adminDashboardStats';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);
    if (!session?.user?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const currentUser = await Customer.findOne({ auth0Id: session.user.sub });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { stats } = await computeAdminDashboardStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[DashboardStats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
