import * as sgMail from '@sendgrid/mail';

let initialized = false;

function init(): void {
  if (initialized) return;
  const key = process.env['SENDGRID_API_KEY'];
  if (!key) throw new Error('SENDGRID_API_KEY not set');
  sgMail.setApiKey(key);
  initialized = true;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  init();
  await sgMail.send({
    to: opts.to,
    from: opts.from ?? 'noreply@nerastay.com',
    subject: opts.subject,
    html: opts.html
  });
}
