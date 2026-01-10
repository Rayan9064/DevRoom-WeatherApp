# Email Service Documentation

## Overview
The Weather Dashboard uses **Resend** for reliable email delivery. Resend is specifically designed for serverless environments and works seamlessly with platforms like Vercel, Render, and traditional Node.js servers.

## Why Resend?
- ✅ **Serverless-friendly**: Works perfectly on Vercel, Render, Railway, etc.
- ✅ **Simple API**: Clean, modern email API
- ✅ **Generous free tier**: 3,000 emails/month
- ✅ **No DMARC issues**: Proper email authentication built-in
- ✅ **Fast delivery**: Emails sent within seconds
- ✅ **Developer-friendly**: Great documentation and dashboard

## Setup Instructions

### 1. Create Resend Account
1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Navigate to **API Keys** in the dashboard
2. Click **Create API Key**
3. Copy the key (format: `re_xxxxxxxxxxxx`)

### 3. Configure Environment Variables

#### Development (.env)
```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Weather Dashboard
FRONTEND_URL=http://localhost:5173
```

#### Production (Render/Vercel)
```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Weather Dashboard
FRONTEND_URL=https://your-app.com
```

### 4. Domain Setup (Optional - For Production)

To send emails from your own domain instead of `onboarding@resend.dev`:

1. **Add Domain in Resend**
   - Go to https://resend.com/domains
   - Click **Add Domain**
   - Enter your domain name (e.g., `yourdomain.com`)
   - Select your region

2. **Configure DNS Records**
   Add these records in your domain provider (e.g., Name.com, GoDaddy, Cloudflare):

   **DKIM (Required)**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [Provided by Resend]
   ```

   **SPF (Required)**
   ```
   Type: MX
   Name: send
   Value: feedback-smtp.ap-northeast-1.amazonses.com
   Priority: 10

   Type: TXT
   Name: send
   Value: v=spf1 include:amazonses.com ~all
   ```

   **DMARC (Optional but Recommended)**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none;
   ```

3. **Verify Domain**
   - Wait 5-15 minutes for DNS propagation
   - Click **Verify Records** in Resend dashboard
   - Look for green checkmark ✅

4. **Update Environment Variable**
   ```env
   EMAIL_FROM=noreply@yourdomain.com
   ```

## Email Types

### 1. OTP Email (Registration)
Sent when a user registers with an OTP code for email verification.

**Template includes:**
- 6-digit OTP code
- Expiration time (5 minutes)
- Security warning
- Professional design

### 2. OTP Email (Password Reset)
Sent when a user requests a password reset with an OTP code.

**Template includes:**
- 6-digit OTP code
- Expiration time (5 minutes)
- Security warning
- Professional design

### 3. Verification Email (Legacy)
Email with a verification link (deprecated in favor of OTP).

**Template includes:**
- Verification button/link
- 24-hour expiration notice
- Welcome message

### 4. Welcome Email
Sent after successful email verification.

**Template includes:**
- Welcome message
- Feature highlights
- Dashboard link
- Professional branding

## API Usage

### In Code (Automatic)
Emails are sent automatically through the `emailService`:

```typescript
import emailService from '../services/emailService';

// Send OTP
await emailService.sendOTPEmail(
  'user@example.com',
  'John Doe',
  '123456',
  'registration'
);

// Send welcome email
await emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

### Test Endpoints (Development Only)

**Send OTP Email:**
```bash
curl -X POST http://localhost:5000/api/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "Test User",
    "otp": "123456",
    "type": "registration"
  }'
```

**Send Welcome Email:**
```bash
curl -X POST http://localhost:5000/api/email/send-welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "Test User"
  }'
```

## Monitoring

### Resend Dashboard
View email delivery status at https://resend.com/emails

**Available metrics:**
- ✉️ Total emails sent
- ✅ Delivered
- ⏳ Deferred
- ❌ Failed
- 📊 Delivery rates

### Application Logs
Email sending is logged in the backend:

```
✅ Email service initialized with Resend
📧 Sending registration OTP email to user@example.com
✅ Email sent successfully to user@example.com
```

## Troubleshooting

### Email Not Received

**1. Check Spam Folder**
- Look in spam/junk folder
- Mark as "Not Spam" for future emails

**2. Verify API Key**
```bash
# Check if RESEND_API_KEY is set
echo $RESEND_API_KEY
```

**3. Check Domain Verification**
- Go to https://resend.com/domains
- Ensure domain shows "Verified" ✅
- Check DNS propagation: https://dnschecker.org

**4. Check Logs**
```bash
# Backend logs will show detailed errors
2026-01-10 17:23:22 error: ❌ Resend email error: The yourdomain.com domain is not verified
```

### Common Errors

**Error: "Domain not verified"**
- Solution: Verify your domain in Resend or use `onboarding@resend.dev`

**Error: "Invalid API key"**
- Solution: Check `RESEND_API_KEY` is correct and active

**Error: "Rate limit exceeded"**
- Solution: Free tier = 3,000 emails/month. Upgrade plan or wait for reset.

**Error: "Invalid from address"**
- Solution: Use verified domain or `onboarding@resend.dev`

## Rate Limits

### Free Tier
- **3,000 emails/month**
- **10 emails/second**
- **API keys: Unlimited**

### Paid Plans
- Pro: $20/month - 50,000 emails
- Enterprise: Custom pricing

## Security Best Practices

1. **Never commit API keys**
   - Use `.env` files
   - Add `.env` to `.gitignore`

2. **Use environment-specific keys**
   - Development key for local
   - Production key for deployed app

3. **Restrict test endpoints in production**
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     // Don't register test email routes
   }
   ```

4. **Monitor usage**
   - Check Resend dashboard regularly
   - Set up alerts for unusual activity

## Migration from SendGrid/Nodemailer

If migrating from another service:

1. Install Resend: `npm install resend`
2. Uninstall old packages: `npm uninstall @sendgrid/mail nodemailer`
3. Update `emailService.ts` to use Resend API
4. Update environment variables
5. Test thoroughly before deploying

## Support

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Community**: https://resend.com/community

## Production Checklist

- [ ] Resend API key configured
- [ ] Domain added and verified
- [ ] DNS records properly set
- [ ] `EMAIL_FROM` using verified domain
- [ ] Test emails received successfully
- [ ] Test endpoints removed or secured
- [ ] Environment variables set in hosting platform
- [ ] Monitoring dashboard checked
- [ ] Rate limits understood
- [ ] Backup email provider considered (optional)

---

**Last Updated**: January 10, 2026  
**Service**: Resend (https://resend.com)  
**Version**: resend@6.7.0
