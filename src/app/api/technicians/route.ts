import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Technician } from '@/models/Technician';

export async function GET() {
  try {
    await connectDB();
    const technicians = await Technician.find({ role: 'technician' }).sort({ name: 1 });
    return NextResponse.json({ technicians });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch technicians' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const technician = await Technician.create(body);
    return NextResponse.json({ technician }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create technician' }, { status: 500 });
  }
}
