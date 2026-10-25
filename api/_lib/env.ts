function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  // Email is optional: the old API refused to boot without SMTP, which makes a fresh
  // deploy fail for a feature that only one endpoint uses. Inquiries are still
  // recorded when this is unset; they just land with emailStatus 'failed'.
  if (!host || !port || !user || !pass || !from) return null;
  return { host, port: Number(port), user, pass, from };
}

export const env = {
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  jwtSecret: required('JWT_SECRET'),
  isProduction: process.env.NODE_ENV === 'production',
  /** Absolute base used for links in outgoing email. */
  clientOrigin: process.env.CLIENT_ORIGIN || 'https://topchoicerealty.vercel.app',
  smtp: smtpConfig(),
};
