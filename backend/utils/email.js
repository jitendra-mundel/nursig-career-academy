import https from 'https';

const sendViaBrevoApi = (apiKey, sender, recipient, subject, text, html, replyTo) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sender: {
        email: sender.email,
        name: sender.name || '',
      },
      to: [{ email: recipient.email, name: recipient.name || '' }],
      subject,
      htmlContent: html,
      textContent: text,
    };

    if (replyTo) {
      payload.replyTo = { email: replyTo };
    }

    const body = JSON.stringify(payload);

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Brevo API response:', res.statusCode, data);
          resolve(true);
        } else {
          console.error('❌ Brevo API error:', res.statusCode, data);
          reject(new Error(`Brevo API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Brevo API request error:', error.message);
      reject(error);
    });

    req.write(body);
    req.end();
  });
};

const sendViaMailgunApi = (domain, apiKey, from, to, subject, text, html) => {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`api:${apiKey}`).toString('base64');
    const postData = new URLSearchParams({
      from,
      to,
      subject,
      text,
      html,
    }).toString();

    const options = {
      hostname: 'api.mailgun.net',
      path: `/v3/${domain}/messages`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Mailgun API response:', res.statusCode, data);
          resolve(true);
        } else {
          console.error('❌ Mailgun API error:', res.statusCode, data);
          reject(new Error(`Mailgun API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Mailgun API request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Primary email sender: Brevo REST API. Fallback: Mailgun REST API.
export const sendOtpEmail = async (to, code) => {
  const normalize = (value) => (typeof value === 'string' ? value.trim() : value);

  const brevoApiKey = normalize(process.env.BREVO_API_KEY);
  const brevoSenderEmail = normalize(process.env.BREVO_SENDER || process.env.EMAIL_FROM);
  const brevoSenderName = normalize(process.env.BREVO_SENDER_NAME || 'NR Nursing Quiz');
  const brevoReplyTo = normalize(process.env.BREVO_REPLY_TO || process.env.EMAIL_FROM);

  const mailgunApiKey = normalize(process.env.MAILGUN_API_KEY);
  const mailgunDomain = normalize(process.env.MAILGUN_DOMAIN);
  const mailgunFrom = normalize(process.env.MAILGUN_FROM || process.env.EMAIL_FROM);

  const subject = 'Your verification code';
  const text = `Your verification OTP is: ${code}. It will expire in 5 minutes.`;
  const html = `<p>Your verification OTP is: <strong>${code}</strong></p><p>It will expire in 5 minutes.</p>`;

  console.log('📧 Email provider config:', {
    brevo: !!brevoApiKey && !!brevoSenderEmail,
    mailgun: !!mailgunApiKey && !!mailgunDomain && !!mailgunFrom,
    from: brevoSenderEmail || mailgunFrom,
  });

  if (brevoApiKey && brevoSenderEmail) {
    try {
      await sendViaBrevoApi(
        brevoApiKey,
        { email: brevoSenderEmail, name: brevoSenderName },
        { email: to },
        subject,
        text,
        html,
        brevoReplyTo,
      );
      console.log('✅ OTP sent via Brevo to', to);
      return true;
    } catch (err) {
      console.error('❌ Brevo send failed:', err.message);
      throw err;
    }
  }

  if (mailgunApiKey && mailgunDomain && mailgunFrom) {
    try {
      await sendViaMailgunApi(mailgunDomain, mailgunApiKey, mailgunFrom, to, subject, text, html);
      console.log('✅ OTP sent via Mailgun to', to);
      return true;
    } catch (err) {
      console.error('❌ Mailgun send failed:', err.message);
      throw err;
    }
  }

  const error = new Error(
    'Email provider not configured. Set BREVO_API_KEY and BREVO_SENDER (recommended), or MAILGUN_API_KEY and MAILGUN_DOMAIN.'
  );
  error.statusCode = 503;
  error.code = 'EMAIL_PROVIDER_NOT_CONFIGURED';
  console.error('❌', error.message);
  throw error;
};
