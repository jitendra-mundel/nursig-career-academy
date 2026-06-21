import nodemailer from 'nodemailer';

// Send OTP email via SMTP only.
export const sendOtpEmail = async (to, code) => {
  const normalize = (value) => (typeof value === 'string' ? value.trim() : value);
  const normalizePassword = (value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value);

  const user = normalize(process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM);
  const pass = normalizePassword(process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
  const from = normalize(process.env.EMAIL_FROM) || user || 'no-reply@example.com';

  const host = normalize(process.env.SMTP_HOST || process.env.EMAIL_HOST);
  const port = normalize(process.env.SMTP_PORT || process.env.EMAIL_PORT);

  console.log('📧 SMTP Debug:', { host, port, user: !!user, pass: !!pass, from });

  const subject = 'Your verification code';
  const text = `Your verification OTP is: ${code}. It will expire in 5 minutes.`;
  const html = `<p>Your verification OTP is: <strong>${code}</strong></p><p>It will expire in 5 minutes.</p>`;

  if (!host || !port || !user || !pass) {
    console.error('❌ SMTP Config Missing:', { host, port, user, pass });
    const error = new Error('SMTP not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS or EMAIL_USER and EMAIL_PASSWORD in backend/.env.');
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
};
