import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { Invitation } from '@/models/Invitation';
import { sendGmail } from '@/lib/google';
import { sendEmail as sendMicrosoftEmail } from '@/lib/microsoft';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    let isAdmin = false;

    // 1. Session Check
    if (session?.user && session.user.role === 'admin') {
      isAdmin = true;
    }

    // 2. Database Fallback Authorization
    if (!isAdmin && session?.user?.email) {
      await connectDB();
      const dbUser = await Customer.findOne({ email: session.user.email });
      if (dbUser?.role === 'admin') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Missing email or role' }, { status: 400 });
    }

    await connectDB();

    // 3. Check if user already exists
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 4. Create Invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await Invitation.findOneAndUpdate(
      { email },
      {
        email,
        role,
        status: 'pending',
        token,
        expiresAt,
        invitedBy: session?.user?.sub || 'system',
      },
      { upsert: true, new: true }
    );

    // 5. Build Invite Link
    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${appBaseUrl}/auth/login?invite=${token}`;

    // 6. Send Email
    const subject = `You're invited to join Final Entry as a ${role}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0b0b0f;">Invitation to Join Final Entry</h2>
        <p>Hello,</p>
        <p>You have been invited to join the <strong>Final Entry</strong> platform as a <strong>${role}</strong>.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${inviteLink}" style="background-color: #c6f135; color: #0b0b0f; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accept Invitation & Sign Up
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you were not expecting this invitation, you can safely ignore this email.</p>
      </div>
    `;

    let emailSent = false;
    let errorMsg = '';

    // Try Google first
    try {
      await sendGmail({ to: email, subject, htmlBody });
      emailSent = true;
      console.log(`[Invitation] Email sent via Google to ${email}`);
    } catch (gErr) {
      console.warn(`[Invitation] Google send failed, trying Microsoft:`, gErr);
      // Fallback to Microsoft
      try {
        await sendMicrosoftEmail({ to: email, subject, htmlBody });
        emailSent = true;
        console.log(`[Invitation] Email sent via Microsoft to ${email}`);
      } catch (msErr) {
        console.error(`[Invitation] Both Google and Microsoft failed:`, msErr);
        errorMsg = 'Failed to send invitation email. Please ensure your Google or Microsoft integration is connected.';
      }
    }

    if (!emailSent) {
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    console.log(`[Invitation Created] For ${email} with role ${role}`);
    return NextResponse.json({ success: true, invitation });

  } catch (error: any) {
    console.error('[Admin Invitation API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
