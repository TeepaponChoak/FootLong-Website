// Test script to verify Resend email configuration
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

console.log('=== Resend Email Configuration Test ===\n');
console.log('API Key:', resendApiKey ? `${resendApiKey.substring(0, 15)}...` : 'NOT SET');
console.log('From:', resendFrom || 'NOT SET');
console.log('');

if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY is not configured in .env');
  console.log('Please add RESEND_API_KEY=re_xxxxx to server/.env');
  process.exit(1);
}

const resend = new Resend(resendApiKey);
console.log('✓ Resend client initialized');

// Test sending an email
const testEmail = async () => {
  try {
    const testTo = process.argv[2] || 'test@example.com';
    
    console.log(`\nAttempting to send test email to: ${testTo}`);
    console.log('From:', resendFrom || 'onboarding@resend.dev');
    
    const data = await resend.emails.send({
      from: resendFrom || 'onboarding@resend.dev',
      to: testTo,
      subject: 'Test Email - FootLong Blog',
      text: 'This is a test email from your FootLong Blog server.',
      html: '<h1>Test Email</h1><p>This is a test email from your FootLong Blog server.</p>'
    });
    
    console.log('\n✅ Email sent successfully!');
    console.log('Response:', data);
  } catch (error) {
    console.error('\n❌ Failed to send email:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    
    console.log('\n--- Troubleshooting Tips ---');
    console.log('1. Check if your Resend API key is valid (starts with re_)');
    console.log('2. Make sure you\'ve verified your domain in Resend dashboard');
    console.log('3. For development, use onboarding@resend.dev as the from address');
    console.log('4. Check if the recipient email is valid');
    console.log('5. Visit https://resend.com/dashboard to check your account status');
  }
};

testEmail();