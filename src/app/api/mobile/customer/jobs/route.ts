import { NextRequest, NextResponse } from 'next/server.js';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Service } from '@/models/Service';
import {
  resolveMobileActor,
  requireRoles,
  type MobileActor,
} from '@/lib/mobileRequestContext';
import { sendEmail, getMicrosoftTokens } from '@/lib/microsoft';
import { sendGmail, getGoogleTokens } from '@/lib/google';

async function guardCustomer(actor: MobileActor) {
  if (!requireRoles(actor, ['customer'])) {
    return NextResponse.json(
      { error: 'Customer role required' },
      { status: 403 }
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  const r = await resolveMobileActor(request);
  if (!r.ok)
    return NextResponse.json({ error: r.error }, { status: r.status });

  const denied = await guardCustomer(r.actor);
  if (denied) return denied;

  await connectDB();
  const jobs = await Job.find({ customerId: r.actor.customer._id })
    .populate('serviceId', 'title slug')
    .populate('technicianId', 'name phone')
    .sort({ createdAt: -1 });

  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  const r = await resolveMobileActor(request);
  if (!r.ok)
    return NextResponse.json({ error: r.error }, { status: r.status });

  const denied = await guardCustomer(r.actor);
  if (denied) return denied;

  try {
    await connectDB();
    const body = await request.json();

    let serviceId = body.serviceId;
    if (serviceId && !String(serviceId).match(/^[0-9a-fA-F]{24}$/)) {
      const service = await Service.findOne({ slug: serviceId });
      if (service) serviceId = service._id;
      else
        return NextResponse.json(
          { error: `Service not found: ${serviceId}` },
          { status: 400 }
        );
    }

    const phone = (
      typeof body.contactPhone === 'string' ? body.contactPhone.trim() : ''
    ) ||
      (typeof r.actor.customer.phone === 'string'
        ? r.actor.customer.phone.trim()
        : '');
    if (!phone) {
      return NextResponse.json(
        { error: 'contactPhone is required when your profile has no phone' },
        { status: 400 }
      );
    }

    const job = await Job.create({
      customerId: r.actor.customer._id,
      serviceId,
      parish: body.parish,
      address: body.address,
      pestDescription: body.pestDescription,
      urgency: body.urgency || 'medium',
      contactName: body.contactName ?? r.actor.customer.name,
      contactEmail: body.contactEmail ?? r.actor.customer.email,
      contactPhone: phone,
      status: 'rfq',
    });

    const msConnected = await getMicrosoftTokens();
    const googleConnected = await getGoogleTokens();

    if (msConnected || googleConnected) {
      const service = await Service.findById(serviceId);
      const to = job.contactEmail;
      const emailConfig = {
        to,
        subject: `Service Request Received: ${service?.title || 'Pest Control'}`,
        htmlBody: `
          <div style="font-family: sans-serif; background: #0b0b0f; color: #f6f3ec; padding: 40px; border-radius: 12px;">
            <div style="border-left: 4px solid #c6f135; padding-left: 20px; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 24px; color: #f6f3ec;">Request Received</h1>
              <p style="color: #c6f135; margin: 5px 0 0 0; font-weight: bold; letter-spacing: 1px;">FINAL ENTRY PEST CONTROL</p>
            </div>
            
            <p>Hi ${body.contactName || r.actor.customer.name},</p>
            <p>We've received your request for <strong>${service?.title || 'Pest Control'}</strong> in <strong>${body.parish}</strong>.</p>
            
            <div style="background: #141418; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #2d2d3a;">
              <h3 style="margin-top: 0; color: #f6f3ec;">Job Details</h3>
              <p style="margin: 5px 0;"><strong>Urgency:</strong> ${body.urgency || 'medium'}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${body.address}</p>
              <p style="margin: 5px 0;"><strong>Description:</strong> ${body.pestDescription}</p>
            </div>

            <p style="color: rgba(246,243,236,0.6);">A licensed technician will review your details and contact you within 2 hours to provide your final quote.</p>
          </div>
        `,
      };

      if (msConnected)
        sendEmail(emailConfig).catch((err: unknown) =>
          console.error('[Email] Microsoft send failed:', err)
        );
      else
        sendGmail(emailConfig).catch((err: unknown) =>
          console.error('[Email] Gmail send failed:', err)
        );
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create quote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
