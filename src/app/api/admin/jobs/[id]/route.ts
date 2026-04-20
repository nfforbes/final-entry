import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import mongoose from 'mongoose';

import { auth0 } from '@/lib/auth0';
import { Customer } from '@/models/Customer';
import { sendGmail } from '@/lib/google';
import { sendEmail as sendMicrosoftEmail } from '@/lib/microsoft';
import crypto from 'crypto';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    await connectDB();

    // Direct DB role check
    const currentUser = await Customer.findOne({ auth0Id: session.user.sub });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }


    // Check if we need to generate a tracking token (if being assigned for the first time)
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const isNewAssignment = 
      (body.technicianId && (!job.technicianId || !job.technicianId.toString().includes(body.technicianId.toString()))) || 
      (body.status === 'assigned' && job.status !== 'assigned') ||
      (body.technicianId && !job.trackingToken);
    
    // Update fields
    if (body.status) {
      job.status = body.status;
      if (body.status === 'signed_off') job.signedOffAt = new Date();
      if (body.status === 'billed') job.billedAt = new Date();
      if (body.status === 'closed') job.closedAt = new Date();
    }
    
    if (body.technicianId !== undefined) {
      job.technicianId = body.technicianId ? new mongoose.Types.ObjectId(body.technicianId) : undefined;
    }
    
    if (body.quotedPrice !== undefined) job.quotedPrice = body.quotedPrice;
    if (body.scheduledDate) job.scheduledDate = body.scheduledDate;

    if (isNewAssignment) {
      job.trackingToken = crypto.randomUUID();
    }

    console.log(`[Job Patch] Pre-save state:`, {
      id,
      technicianId: job.technicianId,
      status: job.status,
      isNewAssignment
    });

    await job.save();

    // Re-populate for response
    const updatedJob = await Job.findById(id)
      .populate('customerId', 'name email')
      .populate('serviceId', 'title')
      .populate('technicianId', 'name');

    console.log(`[Job Patch] Post-save state:`, {
      technicianId: updatedJob?.technicianId
    });

    // 3. Trigger Quote Sent Email
    if (body.status === 'quote_sent' && job.contactEmail) {
      if (!body.quotedPrice && !job.quotedPrice) {
        return NextResponse.json({ error: 'Quoted Price is required for status "Quote Sent"' }, { status: 400 });
      }

      const subject = `Service Quote: Your Final Entry Proposal for ${job.serviceId?.title || 'Pest Control'}`;
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0b0b0f;">Service Quote Prepared</h2>
          <p>Hello ${job.contactName},</p>
          <p>We have prepared a professional quote for your requested service: <strong>${job.serviceId?.title || 'Pest Control'}</strong>.</p>
          
          <div style="background-color: #f6f3ec; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 18px;"><strong>Investment:</strong> $${body.quotedPrice || job.quotedPrice}</p>
            <p style="margin: 5px 0; color: #666;">Location: ${job.address}</p>
          </div>

          <p>If you have attached a proposal PDF, please find it below. To proceed with this service, please contact us or reply to this email.</p>
          
          <p style="color: #666; font-size: 14px;">Thank you for choosing Final Entry.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Final Entry Pest Control - Premium Service</p>
        </div>
      `;

      const attachments = body.attachment ? [{
        name: body.attachment.filename,
        content: body.attachment.data, // Base64
        contentType: body.attachment.contentType || 'application/pdf'
      }] : undefined;

      try {
        await sendGmail({ to: job.contactEmail, subject, htmlBody, attachments });
      } catch (gErr) {
        try {
          await sendMicrosoftEmail({ to: job.contactEmail, subject, htmlBody, attachments });
        } catch (msErr) {
          console.error(`[Job Update] Failed to send quote email:`, msErr);
        }
      }
    }

    // 4. Trigger Notification on Assignment
    if (isNewAssignment && job.contactEmail) {
      const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
      const trackingLink = `${appBaseUrl}/tracking/${job.trackingToken}`;
      
      const subject = `Technician Assigned: Your Final Entry Service is on the way!`;
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0b0b0f;">Technician Assigned</h2>
          <p>Hello ${job.contactName},</p>
          <p>Great news! A technician has been assigned to your service request for <strong>${job.serviceId?.title || 'Pest Control'}</strong>.</p>
          
          <div style="background-color: #f6f3ec; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Status:</strong> Assigned</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.address}</p>
          </div>

          <p>You can track the progress of your technician and see their live location once they are in route by clicking the link below:</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${trackingLink}" style="background-color: #c6f135; color: #0b0b0f; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Track My Technician
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Thank you for choosing Final Entry.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Final Entry Pest Control - Premium Service</p>
        </div>
      `;

      try {
        await sendGmail({ to: job.contactEmail, subject, htmlBody });
        console.log(`[Job Update] Notification sent via Google to ${job.contactEmail}`);
      } catch (gErr) {
        try {
          await sendMicrosoftEmail({ to: job.contactEmail, subject, htmlBody });
          console.log(`[Job Update] Notification sent via Microsoft to ${job.contactEmail}`);
        } catch (msErr) {
          console.error(`[Job Update] Failed to send notification email:`, msErr);
        }
      }
    }

    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
