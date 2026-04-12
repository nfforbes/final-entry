import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Setting, DEFAULT_SETTINGS } from '@/models/Setting';

export async function GET() {
  try {
    await connectDB();
    const settings = await Setting.find({});

    // If no settings exist yet, seed defaults
    if (settings.length === 0) {
      await Setting.insertMany(DEFAULT_SETTINGS);
      return NextResponse.json({
        settings: DEFAULT_SETTINGS.reduce<Record<string, string>>(
          (acc, s) => ({ ...acc, [s.key]: s.value }),
          {}
        ),
      });
    }

    const map = settings.reduce<Record<string, string>>(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {}
    );
    return NextResponse.json({ settings: map });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json() as Record<string, string>;
    const updates = Object.entries(body).map(([key, value]) =>
      Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
    );
    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
