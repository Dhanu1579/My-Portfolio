const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

app.use(
  express.static(path.join(__dirname, 'public'), {
    index: 'index.html',
    redirect: false
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, company, message, website } = req.body || {};

  if (website) return res.status(400).json({ error: 'Invalid request.' });
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message required.' });
  }

  try {
    // ✅ CORRECT (Sends notification TO YOU)
const data = await resend.emails.send({
  from: 'Portfolio Contact <onboarding@resend.dev>',
  to: [process.env.GMAIL_EMAIL], // Your email address where you receive submissions
  replyTo: String(email).trim(), // The visitor's email address
  subject: `New Contact from ${String(name).trim()}`,
  html: `<p><strong>Name:</strong> ${name}</p><p><strong>Message:</strong> ${message}</p>`
});

    console.log('Email sent via Resend:', data);
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});