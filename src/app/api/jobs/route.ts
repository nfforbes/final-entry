import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Service } from '@/models/Service';
import { sendEmail, getMicrosoftTokens } from '@/lib/microsoft';
import { sendGmail, getGoogleTokens } from '@/lib/google';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const jobs = await Job.find(filter)
      .populate('serviceId', 'title slug')
      .populate('technicianId', 'name phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ quotes: jobs, jobs });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Resolve serviceId if it's a slug
    let serviceId = body.serviceId;
    if (serviceId && !serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      const service = await Service.findOne({ slug: serviceId });
      if (service) {
        serviceId = service._id;
      } else {
        return NextResponse.json({ error: `Service not found: ${serviceId}` }, { status: 400 });
      }
    }

    const job = await Job.create({
      serviceId,
      parish: body.parish,
      address: body.address,
      pestDescription: body.pestDescription,
      urgency: body.urgency || 'medium',
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      status: 'rfq',
    });

    // Send confirmation email asynchronously (don't block the response)
    const msConnected = await getMicrosoftTokens();
    const googleConnected = await getGoogleTokens();

    if (msConnected || googleConnected) {
      const service = await Service.findById(serviceId);
      const emailConfig = {
        to: body.contactEmail,
        subject: `Service Request Received: ${service?.title || 'Pest Control'}`,
        htmlBody: `
          <div style="font-family: sans-serif; background: #0b0b0f; color: #f6f3ec; padding: 40px; border-radius: 12px;">
            <div style="border-left: 4px solid #c6f135; padding-left: 20px; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 24px; color: #f6f3ec;">Request Received</h1>
              <p style="color: #c6f135; margin: 5px 0 0 0; font-weight: bold; letter-spacing: 1px;">FINAL ENTRY PEST CONTROL</p>
            </div>
            
            <p>Hi ${body.contactName},</p>
            <p>We've received your request for <strong>${service?.title || 'Pest Control'}</strong> in <strong>${body.parish}</strong>.</p>
            
            <div style="background: #141418; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #2d2d3a;">
              <h3 style="margin-top: 0; color: #f6f3ec;">Job Details</h3>
              <p style="margin: 5px 0;"><strong>Urgency:</strong> ${body.urgency || 'medium'}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${body.address}</p>
              <p style="margin: 5px 0;"><strong>Description:</strong> ${body.pestDescription}</p>
            </div>

            <p style="color: rgba(246,243,236,0.6);">A licensed technician will review your details and contact you within 2 hours to provide your final quote.</p>
            
            <div style="margin-top: 40px; border-top: 1px solid #2d2d3a; pt: 20px;">
              <p style="font-size: 12px; color: rgba(246,243,236,0.4);">
                This is an automated notification from Final Entry. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      if (msConnected) {
        sendEmail(emailConfig).catch(err => console.error('[Email] Microsoft send failed:', err));
      } else {
        sendGmail(emailConfig).catch(err => console.error('[Email] Gmail send failed:', err));
      }
    }

    return NextResponse.json({ job, _id: job._id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create quote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
