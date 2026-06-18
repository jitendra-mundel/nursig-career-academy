import nodemailer from 'nodemailer';

// Send OTP email. Tries SendGrid Web API first if configured, otherwise falls back to SMTP.
export const sendOtpEmail = async (to, code) => {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';

  const subject = 'Your verification code';
  const text = `Your verification OTP is: ${code}. It will expire in 5 minutes.`;
  const html = `<p>Your verification OTP is: <strong>${code}</strong></p><p>It will expire in 5 minutes.</p>`;

  // If SendGrid API key is present, try sending using SendGrid first (more reliable on cloud hosts)
  if (sendgridKey) {
    try {
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(sendgridKey);
      await sgMail.send({ to, from, subject, text, html });
      console.log('📧 Sent OTP via SendGrid to', to);
      return true;
    } catch (err) {
      console.error('📧 SendGrid send failed:', err && (err.code || err.message || err.toString()));
      // continue to SMTP fallback
    }
  }

  // --- SMTP fallback (keeps previous logic) ---
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('📧 SMTP Debug:', { host: !!host, port: !!port, user: !!user, pass: !!pass, from });

  if (!host || !port || !user || !pass) {
    console.error('❌ SMTP Config Missing:', { host, port, user, pass });
    const error = new Error('SMTP not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env or set SENDGRID_API_KEY');
    error.statusCode = 503;
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }

  const lookupFactory = (family) => {
    return (hostname, options, callback) => {
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

  const families = [4, 6, 0];
  const secureOptions = [true, false];

  let lastError;
  for (const secure of secureOptions) {
    for (const family of families) {
      const transporter = createTransporter(secure, family);
      try {
        await transporter.verify();
        await transporter.sendMail({ from, to, subject, text, html });
        console.log('📧 Sent OTP via SMTP to', to, ' (secure=', secure, ', family=', family, ')');
        return true;
      } catch (err) {
        console.error(`📧 SMTP attempt failed (secure=${secure}, family=${family}):`, err.code || err.message);
        lastError = err;
      }
    }
  }

  console.error('📧 All SMTP attempts failed', lastError && (lastError.code || lastError.message));
  throw lastError || new Error('SMTP send failed');
};
