# Email Setup Guide for Password Reset (Using Resend)

This guide explains how to configure email sending for the forgot password feature using **Resend**, which offers 3,000 free emails per month and has a simple setup process.

## Why Resend?

- **Free tier**: 3,000 emails per month (100/day average)
- **No app passwords needed**: Just an API key
- **Better deliverability**: Emails are less likely to go to spam
- **Easy setup**: Takes about 5 minutes
- **Developer-friendly**: Modern API and great documentation

---

## Step-by-Step Setup

### Step 1: Create a Resend Account

1. Go to [Resend.com](https://resend.com/)
2. Click **Get Started** or **Sign Up**
3. Sign up with GitHub, Google, or email
4. Verify your email address

### Step 2: Get Your API Key

1. After signing in, you'll see your **API Key** on the dashboard
2. Copy the API key (it starts with `re_`)
   - Example: `re_1234567890abcdefghijklmnopqrstuvwxyz`

### Step 3: Verify a Domain (Required for Production)

For development, you can use Resend's default domain. For production, verify your own domain:

1. Go to **Domains** in the left sidebar
2. Click **Add Domain**
3. Enter your domain (e.g., `footlongblog.com`)
4. Add the DNS records to your domain's DNS settings:
   - MX record
   - TXT records (SPF, DKIM)
5. Wait for verification (usually a few minutes)

### Step 4: Configure server/.env

Create or edit `server/.env` in your project:

```env
# Resend Configuration
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz

# For development, use Resend's default domain
RESEND_FROM='FootLong Blog <onboarding@resend.dev>'

# For production (after verifying your domain), use:
# RESEND_FROM='FootLong Blog <noreply@yourdomain.com>'
```

### Step 5: Restart the Server

```bash
cd server
npm start
```

### Step 6: Test

1. Go to your app's login page
2. Click "Forgot Password?"
3. Enter an email address
4. Check your inbox - you should receive the reset email!

---

## Troubleshooting

### "Unauthorized" Error

- Make sure your API key is correct and starts with `re_`
- Check that you copied the entire key (no missing characters)

### Email Not Arriving

- Check your spam/junk folder
- Wait a few minutes (Resend can take 1-2 minutes)
- Check Resend dashboard → **Logs** to see if it was sent

### Domain Verification Issues

- Make sure you've added all required DNS records
- Wait a few minutes for DNS propagation
- Check the domain status in Resend dashboard

### Testing Without Resend

If you don't configure Resend, the reset link will be logged to the server console (development mode only):

```
Resend not configured. Password reset link (development only):
http://localhost:5173/reset-password/abc123token
```

Copy this link and paste it into your browser to test the reset functionality.

---

## Security Notes

1. **Never commit your .env file** - It's already in .gitignore
2. **Keep your API key secret** - Don't share it publicly
3. **Monitor your usage** - Check Resend dashboard for email activity
4. **Verify your domain** - For production, always use a verified domain

---

## Free Tier Limits

- **3,000 emails per month** (about 100 per day)
- **100 emails per day** maximum
- No credit card required

When you exceed the free tier, consider upgrading to a paid plan or using a different email service.

---

## Need Help?

- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)
- Check server console for error messages