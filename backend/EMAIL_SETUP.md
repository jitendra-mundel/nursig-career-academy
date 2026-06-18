Email provider setup and test

This file explains how to configure SendGrid or Gmail SMTP for OTP email sending and how to test the endpoints.

1) Preferred: SendGrid (recommended for production)
- Create a SendGrid account and verify a sender email.
- In SendGrid, create an API Key with "Full Access" or at least Mail Send.
- In your Render / hosting service, set the following environment variables:
  - SENDGRID_API_KEY = <your-sendgrid-api-key>
  - SENDGRID_FROM = your-verified-sender@example.com
  - EMAIL_FROM = your-verified-sender@example.com

2) Alternative: Gmail App Password (SMTP)
- Enable 2-Step Verification for your Gmail account.
- Generate an App Password (Mail) and copy the 16-char code.
- In Render, set these environment variables:
  - SMTP_HOST = smtp.gmail.com
  - SMTP_PORT = 587
  - SMTP_USER = your-email@gmail.com
  - SMTP_PASS = <16-char-app-password-without-spaces>
  - EMAIL_FROM = your-email@gmail.com

3) Notes
- The backend `utils/email.js` will try SendGrid first when `SENDGRID_API_KEY` and `SENDGRID_FROM` are set. If SendGrid is not configured, it falls back to SMTP (Gmail or other).
- Do NOT commit `backend/.env` to Git. Use Render/Netlify environment variables or another secret manager.

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