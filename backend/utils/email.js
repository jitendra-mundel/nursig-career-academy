import dns from 'dns';
import https from 'https';
import nodemailer from 'nodemailer';

const sendViaMailgunApi = ({ apiBase, domain, apiKey, from, to, subject, text, html, replyTo }) => {
  const body = new URLSearchParams({ from, to, subject, text, html });
  if (replyTo) body.append('h:Reply-To', replyTo);

  const url = `${apiBase.replace(/\/$/, '')}/${domain}/messages`;
  const auth = Buffer.from(`api:${apiKey}`).toString('base64');
  const parsedUrl = new URL(url);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body.toString()),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`Mailgun API error ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body.toString());
    req.end();
  });
};

// Send OTP email via SMTP or Mailgun.
export const sendOtpEmail = async (to, code) => {
  const normalize = (value) => (typeof value === 'string' ? value.trim() : value);
  const normalizePassword = (value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value);

  const mailgunApiKey = normalize(process.env.MAILGUN_API_KEY);
  const mailgunDomain = normalize(process.env.MAILGUN_DOMAIN);
  const mailgunApiBase = normalize(process.env.MAILGUN_API_BASE) || 'https://api.mailgun.net/v3';
  const mailgunFrom = normalize(process.env.MAILGUN_FROM || process.env.EMAIL_FROM);
  const useMailgunApi = Boolean(mailgunApiKey && mailgunDomain && mailgunFrom);

  const mailgunHost = normalize(process.env.MAILGUN_SMTP_HOST);
  const mailgunPort = normalize(process.env.MAILGUN_SMTP_PORT);
  const mailgunUser = normalize(process.env.MAILGUN_SMTP_USER);
  const mailgunPass = normalize(process.env.MAILGUN_SMTP_PASS);
  const mailgunSecureEnv = normalize(process.env.MAILGUN_SMTP_SECURE);
  const useMailgunSmtp = Boolean(mailgunHost && mailgunPort && mailgunUser && mailgunPass);

  const smtpHost = normalize(process.env.SMTP_HOST || process.env.EMAIL_HOST);
  const smtpPort = normalize(process.env.SMTP_PORT || process.env.EMAIL_PORT);
  const smtpUser = normalize(process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM);
  const smtpPass = normalizePassword(process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
  const secureEnv = normalize(process.env.SMTP_SECURE || process.env.EMAIL_SECURE);
  const secureOverride = secureEnv === 'true' || secureEnv === '1';

  const host = useMailgunSmtp ? mailgunHost : smtpHost;
  const port = useMailgunSmtp ? mailgunPort : smtpPort;
  const user = useMailgunSmtp ? mailgunUser : smtpUser;
  const pass = useMailgunSmtp ? mailgunPass : smtpPass;
  const secure = useMailgunSmtp ? (mailgunSecureEnv === 'true' || mailgunSecureEnv === '1') : (secureEnv ? secureOverride : Number(port) === 465);
  const provider = useMailgunApi ? 'mailgun-api' : useMailgunSmtp ? 'mailgun-smtp' : 'smtp';

  const from = normalize(process.env.EMAIL_FROM) || user || 'no-reply@example.com';
  const replyTo = normalize(process.env.EMAIL_FROM) || user || undefined;

  console.log('📧 Email send provider:', provider, { host, port, secure, user: !!user, pass: !!pass, from, mailgunApiKey: !!mailgunApiKey, mailgunDomain: !!mailgunDomain });

  const subject = 'Your verification code';
  const text = `Your verification OTP is: ${code}. It will expire in 5 minutes.`;
  const html = `<p>Your verification OTP is: <strong>${code}</strong></p><p>It will expire in 5 minutes.</p>`;

  if (useMailgunApi) {
    try {
      await sendViaMailgunApi({ apiBase: mailgunApiBase, domain: mailgunDomain, apiKey: mailgunApiKey, from, to, subject, text, html, replyTo });
      console.log('📧 Sent OTP via Mailgun API to', to);
      return true;
    } catch (err) {
      console.error('📧 Mailgun API send failed:', err.message || err.toString());
      throw err;
    }
  }

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
    console.log('📧 Sent OTP via SMTP to', to, ' (secure=', secure, ')');
    return true;
  } catch (err) {
    console.error('📧 SMTP send failed:', err.code || err.response || err.message || err.toString());
    throw err;
  }
};
