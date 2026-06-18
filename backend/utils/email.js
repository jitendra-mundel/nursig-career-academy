import nodemailer from 'nodemailer';

// Send OTP email. Tries SendGrid Web API first if configured, otherwise falls back to SMTP.
export const sendOtpEmail = async (to, code) => {
  const normalize = (value) => (typeof value === 'string' ? value.trim() : value);
  const normalizePassword = (value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value);

  const sendgridKey = normalize(process.env.SENDGRID_API_KEY);
  const sendgridFrom = normalize(process.env.SENDGRID_FROM);
  const user = normalize(process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM);
  const pass = normalizePassword(process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
  const from = sendgridFrom || normalize(process.env.EMAIL_FROM) || user || 'no-reply@example.com';
  const replyTo = normalize(process.env.EMAIL_FROM) || user || undefined;

  const useSendGrid = Boolean(sendgridKey && sendgridFrom);
  const sendGridMisconfigured = Boolean(sendgridKey && !sendgridFrom);
  const sendGridHalfConfigured = Boolean(!sendgridKey && sendgridFrom);

  if (sendGridMisconfigured) {
    console.warn('📧 SendGrid misconfigured: SENDGRID_API_KEY is set but SENDGRID_FROM is missing. Falling back to SMTP.');
  }
  if (sendGridHalfConfigured) {
    console.warn('📧 SendGrid misconfigured: SENDGRID_FROM is set but SENDGRID_API_KEY is missing. Falling back to SMTP.');
  }

  console.log('📧 Email send config:', { useSendGrid, sendgridKey: !!sendgridKey, sendgridFrom, from, replyTo });

  const subject = 'Your verification code';
  const text = `Your verification OTP is: ${code}. It will expire in 5 minutes.`;
  const html = `<p>Your verification OTP is: <strong>${code}</strong></p><p>It will expire in 5 minutes.</p>`;

  // If SendGrid API key and verified sender are configured, try SendGrid first.
  if (useSendGrid) {
    try {
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(sendgridKey);
      const res = await sgMail.send({ to, from, subject, text, html, replyTo });
      // res is an array of response objects when using @sendgrid/mail
      console.log('📧 Sent OTP via SendGrid to', to, ' SendGrid response:', res && res[0] ? { statusCode: res[0].statusCode, headers: res[0].headers } : res);
      return true;
    } catch (err) {
      console.error('📧 SendGrid send failed:', err && (err.code || err.message || err.toString()));
      // continue to SMTP fallback
    }
  }

  // --- SMTP fallback (keeps previous logic) ---
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;

  console.log('📧 SMTP Debug:', { host: !!host, port: !!port, user: !!user, pass: !!pass, from });

  if (!host || !port || !user || !pass) {
    console.error('❌ SMTP Config Missing:', { host, port, user, pass });
    const error = new Error('SMTP not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS or EMAIL_USER and EMAIL_PASSWORD in backend/.env or set SENDGRID_API_KEY');
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

  const useSecure = Number(port) === 465;
  const transporter = nodemailer.createTransport({
    service: host === 'smtp.gmail.com' ? 'gmail' : undefined,
    host,
    port: Number(port),
    secure: useSecure,
    auth: { user, pass },
    requireTLS: !useSecure,
    authMethod: 'LOGIN',
    lookup: lookupFactory(0),
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  try {
    await transporter.verify();
    await transporter.sendMail({ from, to, subject, text, html });
    console.log('📧 Sent OTP via SMTP to', to, ' (secure=', useSecure, ')');
    return true;
  } catch (err) {
    console.error('📧 SMTP send failed:', err.code || err.message || err.toString());
    throw err;
  }

  console.error('📧 All SMTP attempts failed', lastError && (lastError.code || lastError.message));
  throw lastError || new Error('SMTP send failed');
};
