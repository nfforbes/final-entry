import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lat, lng, isSharing } = await request.json();

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    await connectDB();

    // Check role in DB
    const user = await Customer.findOne({ email: session.user.email });
    if (!user || (user.role !== 'technician' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden. Technician access required.' }, { status: 403 });
    }

    // Update technician location
    const technician = await Customer.findOneAndUpdate(
      { email: session.user.email },
      {
        currentLocation: {
          lat,
          lng,
          updatedAt: new Date(),
        },
        isSharingLocation: isSharing ?? true,
      },
      { new: true }
    );

    console.log(`[Location Update] Technician ${technician?.name} updated location to ${lat}, ${lng}`);

    return NextResponse.json({ success: true, location: technician?.currentLocation });
  } catch (error: any) {
    console.error('[Technician Location API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
