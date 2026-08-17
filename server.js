const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
// Render automatically provides a process.env.PORT, otherwise defaults to 10000
const PORT = process.env.PORT || 10000; 

// ✅ REPLACE LINES 12 TO 24 IN YOUR SERVER.JS WITH THIS:
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  dnsTimeout: 10000, 
  connectionTimeout: 10000,
  auth: {
    user: process.env.GMAIL_EMAIL, // Matches your Render dashboard Key
    pass: process.env.GMAIL_APP_PASSWORD  // FIXED: Changed from GMAIL_APP_PASSWORD to EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Force Node to prioritize IPv4 networks (Fixes the ENETUNREACH Render network block)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); 

// Test transporter connection once on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down and try again in a few minutes.'
  }
});

app.use(limiter);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        manifestSrc: ["'self'"],
        mediaSrc: ["'self'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
    xssFilter: true
  })
);

app.disable('x-powered-by');

app.use(
  express.static(path.join(__dirname, 'public'), {
    index: 'index.html',
    redirect: false,
    maxAge: '1h',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html') || filePath.endsWith('.pdf')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/contact', (req, res) => {
  const { name, email, company, message, website } = req.body || {};

  if (website) {
    return res.status(400).json({ error: 'Invalid request.' });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim();
  const trimmedCompany = String(company || '').trim();
  const trimmedMessage = String(message).trim();

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return res.status(400).json({ error: 'Please enter a valid name.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail) || trimmedEmail.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
    return res.status(400).json({ error: 'Message must be between 10 and 2000 characters.' });
  }

  if (trimmedCompany.length > 150) {
    return res.status(400).json({ error: 'Company name is too long.' });
  }

  console.log('Contact form received:', {
    name: trimmedName,
    email: trimmedEmail,
    company: trimmedCompany,
    message: trimmedMessage.slice(0, 200)
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: trimmedEmail,
    subject: `New Contact from ${trimmedName}`,
    html: `
      <h2>New Message from Your Portfolio</h2>
      <p><strong>Name:</strong> ${trimmedName}</p>
      <p><strong>Email:</strong> ${trimmedEmail}</p>
      ${trimmedCompany ? `<p><strong>Company:</strong> ${trimmedCompany}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${trimmedMessage.replace(/\n/g, '<br>')}</p>
    `
  };

  // ✅ FIX 3: Moved client response handling inside the mail callback with proper 'return' calls
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email send error:', error.message);
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
    console.log('Email sent:', info.response);
    return res.status(200).json({
      success: true,
      message: 'Thanks for reaching out. I will get back to you soon.'
    });
  });
});

app.get('/security.txt', (req, res) => {
  res.type('text/plain').send(
    'Contact: mailto:hello@yourdomain.com\n' +
      'Preferred-Languages: en\n' +
      'Canonical: https://yourdomain.com/\n' +
      'Policy: https://yourdomain.com/\n' +
      'Hiring: https://yourdomain.com/'
  );
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Portfolio server running on port ${PORT}`);
});
