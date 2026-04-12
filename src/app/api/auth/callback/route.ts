import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

// Called by Auth0 after successful login — upserts customer to MongoDB
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const auth0Id = searchParams.get('auth0Id');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (!auth0Id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const customer = await Customer.findOneAndUpdate(
      { auth0Id },
      {
        $setOnInsert: {
          auth0Id,
          email,
          name: name || email,
          role: 'customer',
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: 'Auth callback failed' }, { status: 500 });
  }
}

// Auth0 SDK dynamic route handler
export async function POST(req: NextRequest) {
  return GET(req);
}
