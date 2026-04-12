import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Quote } from '@/models/Quote';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const quotes = await Quote.find(filter)
      .populate('serviceId', 'title slug')
      .populate('technicianId', 'name phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const quote = await Quote.create({
      serviceId: body.serviceId,
      parish: body.parish,
      address: body.address,
      pestDescription: body.pestDescription,
      urgency: body.urgency || 'medium',
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      status: 'pending',
    });

    return NextResponse.json({ quote, _id: quote._id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create quote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
