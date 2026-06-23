import dns from 'dns';
import nodemailer from 'nodemailer';

// Send OTP email via SMTP only.
export const sendOtpEmail = async (to, code) => {
  const normalize = (value) => (typeof value === 'string' ? value.trim() : value);
  const normalizePassword = (value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value);

  const mailgunHost = normalize(process.env.MAILGUN_SMTP_HOST);
  const mailgunPort = normalize(process.env.MAILGUN_SMTP_PORT);
  const mailgunUser = normalize(process.env.MAILGUN_SMTP_USER);
  const mailgunPass = normalize(process.env.MAILGUN_SMTP_PASS);
  const mailgunSecureEnv = normalize(process.env.MAILGUN_SMTP_SECURE);
  const useMailgun = Boolean(mailgunHost && mailgunPort && mailgunUser && mailgunPass);

  const smtpHost = normalize(process.env.SMTP_HOST || process.env.EMAIL_HOST);
  const smtpPort = normalize(process.env.SMTP_PORT || process.env.EMAIL_PORT);
  const smtpUser = normalize(process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM);
  const smtpPass = normalizePassword(process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
  const secureEnv = normalize(process.env.SMTP_SECURE || process.env.EMAIL_SECURE);
  const secureOverride = secureEnv === 'true' || secureEnv === '1';

  const host = useMailgun ? mailgunHost : smtpHost;
  const port = useMailgun ? mailgunPort : smtpPort;
  const user = useMailgun ? mailgunUser : smtpUser;
  const pass = useMailgun ? mailgunPass : smtpPass;
  const secure = useMailgun ? (mailgunSecureEnv === 'true' || mailgunSecureEnv === '1') : (secureEnv ? secureOverride : Number(port) === 465);
  const provider = useMailgun ? 'mailgun-smtp' : 'smtp';

  const from = normalize(process.env.EMAIL_FROM) || user || 'no-reply@example.com';
  const replyTo = normalize(process.env.EMAIL_FROM) || user || undefined;

  console.log('📧 SMTP Debug:', { provider, host, port, secure, user: !!user, pass: !!pass, from });

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

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: { user, pass },
    requireTLS: true,
    ignoreTLS: false,
    tls: { rejectUnauthorized: false },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    lookup: (hostname, options, callback) => dns.lookup(hostname, { family: options.family || 0 }, callback),
  });

  try {
    await transporter.verify();
    await transporter.sendMail({ from, to, subject, text, html, replyTo });
    console.log('📧 Sent OTP via SMTP to', to, ' (secure=', useSecure, ')');
    return true;
  } catch (err) {
    console.error('📧 SMTP send failed:', err.code || err.response || err.message || err.toString());
    throw err;
  }
};
