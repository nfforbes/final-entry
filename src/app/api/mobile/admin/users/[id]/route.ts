import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const r = await resolveMobileActor(request);
    if (!r.ok)
      return NextResponse.json({ error: r.error }, { status: r.status });

    if (!requireRoles(r.actor, ['admin'])) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const user = await Customer.findByIdAndUpdate(
      id,
      { role: body.role },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const r = await resolveMobileActor(request);
    if (!r.ok)
      return NextResponse.json({ error: r.error }, { status: r.status });

    if (!requireRoles(r.actor, ['admin'])) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();
    const user = await Customer.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
