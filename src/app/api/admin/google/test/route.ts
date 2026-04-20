import { NextRequest, NextResponse } from 'next/server';
import { sendGmail } from '@/lib/google';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
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
      console.log(`[Auth Fallback] Admin role verified via DB for Google Test: ${session.user.email}`);
    }
  }

  if (!session || !session.user || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to } = await req.json();
  if (!to) {
    return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
  }

  try {
    await sendGmail({
      to,
      subject: 'Final Entry - Google Integration Test',
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #c6f135; border-radius: 8px;">
          <h2 style="color: #0b0b0f;">Integration Success!</h2>
          <p>This is a test email from your <strong>Final Entry</strong> administrative portal.</p>
          <p>Your Google Workspace account is now successfully linked for Gmail delivery.</p>
          <hr style="border: none; border-top: 1px solid #2d2d3a; margin: 20px 0;">
          <small style="color: #666;">Sent at: ${new Date().toLocaleString()}</small>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Google Test Email] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send test email' }, { status: 500 });
  }
}
