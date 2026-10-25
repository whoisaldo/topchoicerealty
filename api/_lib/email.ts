import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env.js';

type Listing = {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
};

type Agent = { name: string; email: string };

type Inquiry = { name: string; email: string; phone?: string; message: string };

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.smtp) return null;
  // Built on first use rather than at import, so a function that never sends mail
  // doesn't pay for it on cold start.
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
}

/** The old template interpolated the visitor's message straight into HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sends the agent notification for a new inquiry. Returns the value to store in
 * `inquiries.email_status` — a delivery failure must not fail the visitor's request.
 */
export async function sendInquiryEmail(
  inquiry: Inquiry,
  listing: Listing,
  agent: Agent
): Promise<'sent' | 'failed'> {
  const mailer = getTransporter();
  if (!mailer || !env.smtp) {
    console.warn('SMTP is not configured; inquiry recorded without notifying the agent.');
    return 'failed';
  }

  try {
    await mailer.sendMail({
      from: env.smtp.from,
      to: agent.email,
      replyTo: inquiry.email,
      subject: `New Inquiry: ${listing.title}`,
      html: inquiryHtml(inquiry, listing, agent),
    });
    return 'sent';
  } catch (error) {
    console.error('Failed to send inquiry email:', error);
    return 'failed';
  }
}

function inquiryHtml(inquiry: Inquiry, listing: Listing, agent: Agent): string {
  const specs = `${escapeHtml(listing.neighborhood)} &bull; $${listing.price.toLocaleString()} &bull; ${listing.beds} beds &bull; ${listing.baths} baths`;
  const phoneRow = inquiry.phone
    ? `<tr><td style="padding:4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;"><a href="tel:${escapeHtml(inquiry.phone)}" style="color:#7c3aed;">${escapeHtml(inquiry.phone)}</a></td></tr>`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:24px;color:#ffffff;">
        <h1 style="margin:0;font-size:20px;">&#127968; New Inquiry from Top Choice Realty</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;">Hi ${escapeHtml(agent.name)},</p>
        <p style="margin:0 0 20px;">You have a new inquiry on one of your listings.</p>

        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
          <h2 style="margin:0 0 4px;font-size:16px;">${escapeHtml(listing.title)}</h2>
          <p style="margin:0 0 4px;color:#6b7280;">${escapeHtml(listing.address)}</p>
          <p style="margin:0;color:#6b7280;font-size:14px;">${specs}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
          <tr><td style="padding:4px 0;color:#6b7280;width:80px;">Name</td><td style="padding:4px 0;">${escapeHtml(inquiry.name)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(inquiry.email)}" style="color:#7c3aed;">${escapeHtml(inquiry.email)}</a></td></tr>
          ${phoneRow}
        </table>

        <div style="background:#f9fafb;border-left:3px solid #7c3aed;padding:12px 16px;margin-bottom:24px;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</div>

        <a href="${env.clientOrigin}/listings/${listing.id}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;margin-right:8px;">View Listing</a>
        <a href="${env.clientOrigin}/dashboard" style="display:inline-block;background:#ffffff;color:#7c3aed;border:1px solid #7c3aed;padding:10px 18px;border-radius:6px;text-decoration:none;">Go to Dashboard</a>
      </div>
      <div style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">
        Top Choice Realty &bull; Staten Island, NY
      </div>
    </div>
  </body>
</html>`;
}
