import { NextRequest, NextResponse } from 'next/server';
import { Setting } from '@/models/Setting';
import { connectDB } from '@/lib/mongodb';
import { auth0 } from '@/lib/auth0';
import { Customer } from '@/models/Customer';

export async function POST(req: NextRequest) {
    const session = await auth0.getSession(req);
    
    // Authorization Check with DB Fallback
    let isAdmin = session?.user?.role === 'admin';
    if (!isAdmin && session?.user?.sub) {
      await connectDB();
      const user = await Customer.findOne({ auth0Id: session.user.sub });
      if (user?.role === 'admin') {
        isAdmin = true;
        console.log(`[Auth Fallback] Admin role verified via DB for config: ${session.user.email}`);
      }
    }

    if (!session || !session.user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { type, config } = await req.json();

  if (!['microsoft', 'google'].includes(type) || !config) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await connectDB();

  const key = `${type}_config`;
  
  // Validation (ensure required fields are present)
  if (type === 'microsoft' && (!config.clientId || !config.clientSecret || !config.tenantId)) {
    return NextResponse.json({ error: 'Missing required Microsoft configuration fields' }, { status: 400 });
  }
  if (type === 'google' && (!config.clientId || !config.clientSecret)) {
    return NextResponse.json({ error: 'Missing required Google configuration fields' }, { status: 400 });
  }

  try {
    // If the clientSecret is a mask (starts with '****'), we preserve the old one
    if (config.clientSecret && config.clientSecret.includes('...')) {
      const existing = await Setting.findOne({ key });
      if (existing) {
        const oldConfig = JSON.parse(existing.value);
        config.clientSecret = oldConfig.clientSecret;
      }
    }

    await Setting.findOneAndUpdate(
      { key },
      { value: JSON.stringify(config) },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(`[Config API] Error saving ${type} config:`, err);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
