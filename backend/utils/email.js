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

  const createTransporter = (useSecure = Number(port) === 465) => {
    return nodemailer.createTransport({
      host,
      port: Number(useSecure ? 465 : port),
      secure: useSecure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  };

  let transporter = createTransporter();

  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    console.error('📧 Email send failed:', error.code || error.message);
    if (error.code === 'ENETUNREACH' || error.code === 'ECONNREFUSED' || error.responseCode === 421) {
      transporter = createTransporter(true);
      await transporter.sendMail({ from, to, subject, text, html });
    } else {
      throw error;
    }
  }

  return true;
};
