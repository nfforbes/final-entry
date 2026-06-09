import mongoose from 'mongoose';
import crypto from 'crypto';
import { Job } from '@/models/Job';
import { sendGmail } from '@/lib/google';
import { sendEmail as sendMicrosoftEmail } from '@/lib/microsoft';

type AdminJobPatchBody = {
  status?: string;
  technicianId?: string | null;
  quotedPrice?: number;
  scheduledDate?: string | Date;
  attachment?: { filename?: string; data?: string; contentType?: string };
};

export type AdminJobPatchResult =
  | { ok: true; job: unknown }
  | { ok: false; status: number; error: string };

/**
 * Applies the same logic as PATCH /api/admin/jobs/[id] (web session).
 * Caller must verify admin identity before invoking.
 */
/** `adminUser` is unused but kept so callers explicitly pass verified admin guard context. */
export async function executeAdminJobPatch(
  _adminUser: unknown,
  jobId: string,
  body: AdminJobPatchBody
): Promise<AdminJobPatchResult> {
  const job = await Job.findById(jobId);
  if (!job) {
    return { ok: false, status: 404, error: 'Job not found' };
  }

  // Validate quote flow before persisting inconsistent state
  if (
    body.status === 'quote_sent' &&
    job.contactEmail &&
    body.quotedPrice === undefined &&
    (job.quotedPrice === undefined || job.quotedPrice === null)
  ) {
    return {
      ok: false,
      status: 400,
      error: 'Quoted Price is required for status "Quote Sent"',
    };
  }

  const isNewAssignment =
    (body.technicianId &&
      (!job.technicianId ||
        !job.technicianId.toString().includes(String(body.technicianId)))) ||
    (body.status === 'assigned' && job.status !== 'assigned') ||
    !!(body.technicianId && !job.trackingToken);

  if (body.status) {
    job.status = body.status as typeof job.status;
    if (body.status === 'signed_off') job.signedOffAt = new Date();
    if (body.status === 'billed') job.billedAt = new Date();
    if (body.status === 'closed') job.closedAt = new Date();
  }

  if (body.technicianId !== undefined) {
    job.technicianId = body.technicianId
      ? new mongoose.Types.ObjectId(String(body.technicianId))
      : undefined;
  }

  if (body.quotedPrice !== undefined) job.quotedPrice = body.quotedPrice;
  if (body.scheduledDate) job.scheduledDate = body.scheduledDate as Date;

  if (isNewAssignment) {
    job.trackingToken = crypto.randomUUID();
  }

  await job.save();

  const updatedJob = await Job.findById(jobId)
    .populate('customerId', 'name email')
    .populate('serviceId', 'title')
    .populate('technicianId', 'name');

  const serviceTitle =
    typeof updatedJob?.serviceId === 'object' &&
    updatedJob?.serviceId !== null &&
    'title' in updatedJob.serviceId
      ? (updatedJob.serviceId as { title?: string }).title
      : 'Pest Control';

  if (body.status === 'quote_sent' && job.contactEmail) {
    const subject = `Service Quote: Your Final Entry Proposal for ${serviceTitle}`;
    const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0b0b0f;">Service Quote Prepared</h2>
          <p>Hello ${job.contactName},</p>
          <p>We have prepared a professional quote for your requested service: <strong>${serviceTitle}</strong>.</p>

          <div style="background-color: #f6f3ec; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 18px;"><strong>Investment:</strong> $${body.quotedPrice ?? job.quotedPrice}</p>
            <p style="margin: 5px 0; color: #666;">Location: ${job.address}</p>
          </div>

          <p>If you have attached a proposal PDF, please find it below. To proceed with this service, please contact us or reply to this email.</p>

          <p style="color: #666; font-size: 14px;">Thank you for choosing Final Entry.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Final Entry Pest Control - Premium Service</p>
        </div>
      `;

    const attachments =
      body.attachment?.filename && body.attachment?.data
        ? [
            {
              name: body.attachment.filename,
              content: body.attachment.data,
              contentType: body.attachment.contentType || 'application/pdf',
            },
          ]
        : undefined;

    try {
      await sendGmail({
        to: job.contactEmail,
        subject,
        htmlBody,
        attachments,
      });
    } catch (gErr) {
      try {
        await sendMicrosoftEmail({
          to: job.contactEmail,
          subject,
          htmlBody,
          attachments,
        });
      } catch (msErr) {
        console.error(`[Job Update] Failed to send quote email:`, msErr);
      }
    }
  }

  if (isNewAssignment && job.contactEmail) {
    const appBaseUrl =
      process.env.APP_BASE_URL ||
      process.env.AUTH0_BASE_URL ||
      'http://localhost:3000';
    const trackingLink = `${appBaseUrl}/tracking/${job.trackingToken}`;

    const subject = `Technician Assigned: Your Final Entry Service is on the way!`;
    const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0b0b0f;">Technician Assigned</h2>
          <p>Hello ${job.contactName},</p>
          <p>Great news! A technician has been assigned to your service request for <strong>${serviceTitle}</strong>.</p>

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
      console.log(
        `[Job Update] Notification sent via Google to ${job.contactEmail}`
      );
    } catch (gErr) {
      try {
        await sendMicrosoftEmail({
          to: job.contactEmail,
          subject,
          htmlBody,
        });
        console.log(
          `[Job Update] Notification sent via Microsoft to ${job.contactEmail}`
        );
      } catch (msErr) {
        console.error(`[Job Update] Failed to send notification email:`, msErr);
      }
    }
  }

  return { ok: true, job: updatedJob };
}
