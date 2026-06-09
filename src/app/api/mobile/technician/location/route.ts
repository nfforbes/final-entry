import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

export async function POST(request: NextRequest) {
  try {
    const r = await resolveMobileActor(request);
    if (!r.ok)
      return NextResponse.json({ error: r.error }, { status: r.status });

    if (!requireRoles(r.actor, ['technician', 'admin'])) {
      return NextResponse.json(
        { error: 'Technician or admin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { lat, lng, isSharing } = body;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    await connectDB();

    const technician = await Customer.findOneAndUpdate(
      { _id: r.actor.customer._id },
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

    return NextResponse.json({
      success: true,
      location: technician?.currentLocation ?? null,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
