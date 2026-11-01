// test-email-fixed.js
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🔍 Testing Gmail connection...');
  
  // Try different configurations
  const configs = [
    {
      name: 'TLS (port 587)',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true
    },
    {
      name: 'SSL (port 465)',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true
    },
    {
      name: 'Alternative TLS',
      host: 'smtp.gmail.com',
      port: 25,
      secure: false,
      requireTLS: true
    }
  ];

  for (const config of configs) {
    console.log(`\n🔄 Trying ${config.name}...`);
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      await transporter.verify();
      console.log(`✅ ${config.name} connection successful!`);

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER,
        subject: `Test - ${config.name}`,
        text: `Testing ${config.name} configuration`
      });

      console.log(`✅ Email sent via ${config.name}!`);
      console.log(`📧 Message ID: ${info.messageId}`);
      return; // Success!
      
    } catch (error) {
      console.log(`❌ ${config.name} failed: ${error.message}`);
    }
  }
  
  console.log('\n🚨 All configurations failed. Trying troubleshooting steps...');
  troubleshoot();
}

async function troubleshoot() {
  console.log('\n🔧 Troubleshooting steps:');
  
  // 1. Check if credentials are correct
  console.log('1. Checking credentials...');
  console.log(`   Email: ${process.env.EMAIL_USER}`);
  console.log(`   Password: ${process.env.EMAIL_PASSWORD ? '***set***' : 'NOT SET'}`);
  
  // 2. Check Google Account settings
  console.log('\n2. Google Account requirements:');
  console.log('   a) Go to: https://myaccount.google.com/lesssecureapps');
  console.log('      - Turn ON "Less secure app access" (if available)');
  console.log('   b) Go to: https://accounts.google.com/DisplayUnlockCaptcha');
  console.log('      - Click "Continue" to unlock captcha');
  console.log('   c) Make sure 2-Step Verification is ON');
  console.log('   d) Use App Password, not regular password');
  
  // 3. Try without password (to see if it's auth issue)
  console.log('\n3. Testing connection without auth...');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false
    });
    
    await transporter.verify();
    console.log('   ✅ Can connect to Gmail (auth issue)');
  } catch (error) {
    console.log(`   ❌ Cannot connect at all: ${error.message}`);
    console.log('   🔧 Check firewall/network blocking port 587');
  }
}

testEmail();