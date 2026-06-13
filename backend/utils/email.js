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

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to, subject, text, html });
  return true;
};
