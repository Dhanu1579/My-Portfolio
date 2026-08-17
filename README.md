# Portfolio

This is a lightweight Express portfolio site (Node.js) built with security-first defaults. It showcases my personal engineering projects and features an interactive contact form that sends messages straight to my inbox.

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Email Service:** Nodemailer (via Gmail SMTP)
- **Security:** Helmet.js integrated for HTTP header protection

## ⚡ Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in your root directory:
   ```env
   EMAIL_USER=dhanushpinjerla@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

3. **Run locally**
   ```bash
   npm start
   ```
   Open: http://localhost:3000

## 📂 Project Highlights
- **Contact Form Routing:** Fully functional automated backend emails via Nodemailer.
- **Responsive Layout:** Tailored with semantic layout blocks and built-in support for `prefers-reduced-motion` settings.
- **Resume Hosting:** The active resume asset used by the site is stored locally inside `public/resume.pdf`.
