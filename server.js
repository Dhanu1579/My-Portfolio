import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Proper __dirname setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, message, website } = req.body;

    if (website) {
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const data = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [process.env.GMAIL_EMAIL],
      replyTo: String(email).trim(),
      subject: `New Contact Form Submission from ${String(name).trim()}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
          <h2>New Portfolio Message</h2>
          <hr />
          <p><strong>Name:</strong> ${String(name).trim()}</p>
          <p><strong>Email:</strong> ${String(email).trim()}</p>
          <p><strong>Company:</strong> ${company ? String(company).trim() : 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            ${String(message).trim().replace(/\n/g, '<br/>')}
          </div>
        </div>
      `
    });

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'Failed to send email.' });
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fallback to index.html for single page layout
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});