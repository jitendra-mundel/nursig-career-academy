import nodemailer from 'nodemailer';

export const sendOtpEmail = async (to, code) => {
  // Read from process.env at function call time (not module load time)
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || (user || 'no-reply@example.com');

  console.log('📧 Email Debug:', { host: !!host, port: !!port, user: !!user, pass: !!pass, from });
  console.log('📧 Values:', { host, port, user, pass: pass ? '***' : 'undefined' });

  const subject = 'Your verification code';
  const text = `Your verification OTP is: ${code}. It will expire in 5 minutes.`;
  const html = `<p>Your verification OTP is: <strong>${code}</strong></p><p>It will expire in 5 minutes.</p>`;

  if (!host || !port || !user || !pass) {
    console.error('❌ SMTP Config Missing:', { host, port, user, pass });
    const error = new Error('SMTP not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env');
    error.statusCode = 503;
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }

  // Helper to force IPv4/IPv6 lookup when needed
  const lookupFactory = (family) => {
    return (hostname, options, callback) => {
      // family: 4, 6 or 0 (0 => system default)
      if (!family || family === 0) return require('dns').lookup(hostname, options, callback);
      return require('dns').lookup(hostname, { family }, callback);
    };
  };

  const createTransporter = (useSecure = Number(port) === 465, family = 0) => {
    return nodemailer.createTransport({
      service: host === 'smtp.gmail.com' ? 'gmail' : undefined,
      host,
      port: Number(useSecure ? 465 : port),
      secure: useSecure,
      auth: { user, pass },
      pool: true,
      maxConnections: 1,
      maxMessages: 100,
      requireTLS: !useSecure,
      lookup: lookupFactory(family),
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  };

  // Try combinations: secure (465) then non-secure (STARTTLS/587), prefer IPv4, then IPv6, then default
  const families = [4, 6, 0];
  const secureOptions = [true, false];

  let lastError;
  for (const secure of secureOptions) {
    for (const family of families) {
      const transporter = createTransporter(secure, family);
      try {
        // verify quickly to fail fast on auth/network
        await transporter.verify();
        await transporter.sendMail({ from, to, subject, text, html });
        return true;
      } catch (err) {
        console.error(`📧 SMTP attempt failed (secure=${secure}, family=${family}):`, err.code || err.message);
        lastError = err;
        // continue to next attempt
      }
    }
  }

  // If reached here, all attempts failed
  console.error('📧 All SMTP attempts failed', lastError && (lastError.code || lastError.message));
  throw lastError || new Error('SMTP send failed');

  return true;
};
