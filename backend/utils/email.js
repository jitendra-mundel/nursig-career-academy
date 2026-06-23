import https from 'https';

// Send OTP via Mailgun REST API (HTTPS - works on Render)
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
        'Authorization': `Basic ${auth}`,
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
        if (res.statusCode === 200) {
          console.log('✅ Mailgun API response:', data);
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

// Send OTP email via Mailgun REST API
export const sendOtpEmail = async (to, code) => {
  const normalize = (value) => (typeof value === 'string' ? value.trim() : value);

  const mailgunApiKey = normalize(process.env.MAILGUN_API_KEY);
  const mailgunDomain = normalize(process.env.MAILGUN_DOMAIN);
  const mailgunFrom = normalize(process.env.MAILGUN_FROM || process.env.EMAIL_FROM);

  console.log('📧 Email config:', {
    hasApiKey: !!mailgunApiKey,
    hasDomain: !!mailgunDomain,
    from: mailgunFrom,
  });

  if (!mailgunApiKey || !mailgunDomain || !mailgunFrom) {
    const error = new Error(
      `Mailgun not configured. Set MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM (or EMAIL_FROM) in Render env vars.`
    );
    error.statusCode = 503;
    error.code = 'MAILGUN_NOT_CONFIGURED';
    console.error('❌', error.message);
    throw error;
  }

  const subject = 'Your verification code';
  const text = `Your verification OTP is: ${code}. It will expire in 5 minutes.`;
  const html = `<p>Your verification OTP is: <strong>${code}</strong></p><p>It will expire in 5 minutes.</p>`;

  try {
    await sendViaMailgunApi(mailgunDomain, mailgunApiKey, mailgunFrom, to, subject, text, html);
    console.log('✅ OTP sent to', to);
    return true;
  } catch (err) {
    console.error('❌ Failed to send OTP:', err.message);
    throw err;
  }
};
