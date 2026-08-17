const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Prioritize IPv4
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS via STARTTLS
  family: 4,     // 👈 FORCE NODEMAILER TO USE IPV4 ONLY (Fixes ENETUNREACH on Render)
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error) => {
  if (error) {
    console.error('Transporter status:', error.message);
  } else {
    console.log('Email service ready');
  }
});

app.use(
  express.static(path.join(__dirname, 'public'), {
    index: 'index.html',
    redirect: false
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, company, message, website } = req.body || {};

  if (website) return res.status(400).json({ error: 'Invalid request.' });
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message required.' });
  }

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: process.env.GMAIL_EMAIL,
    replyTo: String(email).trim(),
    subject: `New Contact from ${String(name).trim()}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('Send error:', err.message);
      return res.status(500).json({ error: 'Failed to send message.' });
    }
    return res.status(200).json({ success: true, message: 'Message sent!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});