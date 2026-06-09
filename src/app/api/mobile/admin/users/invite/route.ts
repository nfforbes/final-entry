import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { Invitation } from '@/models/Invitation';
import {
  resolveMobileActor,
  requireRoles,
} from '@/lib/mobileRequestContext';
import { sendGmail } from '@/lib/google';
import { sendEmail as sendMicrosoftEmail } from '@/lib/microsoft';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const r = await resolveMobileActor(request);
    if (!r.ok)
      return NextResponse.json({ error: r.error }, { status: r.status });

    if (!requireRoles(r.actor, ['admin'])) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Missing email or role' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

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
        invitedBy: r.actor.bearerSub,
      },
      { upsert: true, new: true }
    );

    const appBaseUrl =
      process.env.APP_BASE_URL ||
      process.env.AUTH0_BASE_URL ||
      'http://localhost:3000';
    const inviteLink = `${appBaseUrl}/auth/login?invite=${token}`;

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
      </div>
    `;

    let emailSent = false;
    let errorMsg = '';

    try {
      await sendGmail({ to: email, subject, htmlBody });
      emailSent = true;
    } catch (gErr) {
      try {
        await sendMicrosoftEmail({ to: email, subject, htmlBody });
        emailSent = true;
      } catch (msErr) {
        console.error(`[Invitation] Both Google and Microsoft failed:`, msErr);
        errorMsg =
          'Failed to send invitation email. Ensure Google or Microsoft mail is connected.';
      }
    }

    if (!emailSent) {
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    return NextResponse.json({ success: true, invitation });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
