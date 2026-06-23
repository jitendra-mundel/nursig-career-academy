Email provider setup and test

This file explains how to configure SMTP for OTP email sending and how to test the endpoints.

1) SMTP configuration
- Use a mail account or transactional SMTP provider that supports external SMTP connections.
- For Zoho Mail, use the Zoho SMTP host and password from your Zoho account.
- For Zoho, preferred settings are:
  - SMTP_HOST = smtp.zoho.in
  - SMTP_PORT = 465
  - SMTP_SECURE = true
  - SMTP_USER = info@nrnursingquizandnotes.in
  - SMTP_PASS = <your-zoho-smtp-password>
  - EMAIL_FROM = info@nrnursingquizandnotes.in
- If you use port 587 instead, set `SMTP_SECURE=false` and make sure `SMTP_PASS` is correct.
- If Render still times out, use Mailgun SMTP instead.

2) Mailgun SMTP (preferred on Render if direct SMTP fails)
- Create a Mailgun account and get SMTP credentials.
- In Render, set these environment variables instead of Zoho:
  - MAILGUN_SMTP_HOST = smtp.mailgun.org
  - MAILGUN_SMTP_PORT = 587
  - MAILGUN_SMTP_SECURE = false
  - MAILGUN_SMTP_USER = postmaster@YOUR_DOMAIN
  - MAILGUN_SMTP_PASS = <your-mailgun-smtp-password>
  - EMAIL_FROM = your-email@YOUR_DOMAIN

3) Notes
- The backend `utils/email.js` now supports Mailgun SMTP via `MAILGUN_SMTP_*` env vars.
- If Mailgun SMTP is configured, it takes priority over the generic SMTP env vars.
- Do NOT commit `backend/.env` to Git. Use Render/Netlify environment variables or another secret manager.
- Do NOT commit `backend/.env` to Git. Use Render/Netlify environment variables or another secret manager.

3) Test endpoints (after redeploy)
- Test email (debug helper):

  curl -X POST https://<your-backend-host>/api/auth/test-email \
    -H "Content-Type: application/json" \
    -d '{"to":"you@example.com"}'

- Send OTP (normal flow):

  curl -X POST https://<your-backend-host>/api/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com"}'

Expected responses:
- `test-email`: { "success": true, "message": "Test email sent (OTP flow)" }
- `send-otp`: { "success": true, "message": "OTP sent" }

4) Debugging
- Check backend logs for the startup log line `📧 SMTP Debug:` to confirm environment variables are present.
- Check logs for `✅ OTP <code> sent to <email>` or `❌ Failed to send OTP email:`.

5) If issues persist
- Verify the SMTP provider host, port, username, and password are correct.
- If direct Gmail SMTP is blocked by your host, use another SMTP provider such as Zoho, Mailgun, or a transactional SMTP service.

4) Test endpoints (after redeploy)
- Test email (debug helper):

  curl -X POST https://<your-backend-host>/api/auth/test-email \
    -H "Content-Type: application/json" \
    -d '{"to":"you@example.com"}'

- Send OTP (normal flow):

  curl -X POST https://<your-backend-host>/api/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com"}'

Expected responses:
- `test-email`: { "success": true, "message": "Test email sent (OTP flow)" }
- `send-otp`: { "success": true, "message": "OTP sent" }

5) Debugging
- Check Render logs for the startup log line `🔧 Backend env config: { SMTP_HOST: true, ... }` to confirm environment variables are present.
- Check Render logs for `✅ OTP <code> sent to <email>` or `❌ Failed to send OTP email:` messages.

6) If issues persist
- Verify `VITE_API_BASE_URL` is set in Netlify to your backend URL (including `/api`), then rebuild the frontend.
- Use the `test-email` endpoint to isolate email issues from OTP generation/DB logic.

If you want, I can run the `curl` tests for you (you must provide the backend URL).