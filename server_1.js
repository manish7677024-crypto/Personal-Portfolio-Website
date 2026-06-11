// server.js — Portfolio Backend (Node.js + Express + PostgreSQL)
// Run: node server.js   |   Env vars in .env

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app  = express();
const port = process.env.PORT || 3001;

// ── PostgreSQL Pool ───────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use('/api', limiter);

// ── DB Init ───────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      tags        TEXT[],
      demo_url    TEXT,
      github_url  TEXT,
      emoji       TEXT DEFAULT '💻',
      featured    BOOLEAN DEFAULT false,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      subject    TEXT,
      message    TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Seed example projects if table is empty
  const { rows } = await pool.query('SELECT COUNT(*) FROM projects');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO projects (title, description, tags, demo_url, github_url, emoji, featured) VALUES
      ('ShopSphere', 'Full-featured e-commerce platform with Stripe, real-time inventory, and a recommendation engine.', '{"React","Node.js","PostgreSQL","Redis","Stripe"}', 'https://shopsphere.demo', 'https://github.com', '🛒', true),
      ('DataPulse Dashboard', 'Real-time analytics dashboard with WebSocket streams and D3 charts.', '{"React","D3.js","Flask","MongoDB"}', '#', 'https://github.com', '📊', false),
      ('Nexus Chat', 'Slack-like team chat with E2E encryption and threaded replies.', '{"Next.js","Socket.io","PostgreSQL"}', '#', 'https://github.com', '💬', false),
      ('GreenDeploy CLI', 'CLI to estimate and offset carbon footprint of cloud deployments.', '{"Python","Click","GCP API"}', '#', 'https://github.com', '🌱', false)
    `);
    console.log('✅ Database seeded with example projects');
  }

  console.log('✅ Database initialised');
}

// ── Routes ────────────────────────────────────────────────────────

// GET /api/projects — returns all projects, featured first
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects ORDER BY featured DESC, created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id — single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// POST /api/contact — save message + send email
app.post('/api/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be ≥10 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, subject = '(no subject)', message } = req.body;

    try {
      // Save to DB
      await pool.query(
        'INSERT INTO messages (name, email, subject, message) VALUES ($1,$2,$3,$4)',
        [name, email, subject, message]
      );

      // Send email notification (configure SMTP in .env)
      if (process.env.SMTP_HOST) {
        const transporter = nodemailer.createTransport({
          host:   process.env.SMTP_HOST,
          port:   465,
          secure: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from:    `"Portfolio Contact" <${process.env.SMTP_USER}>`,
          to:      process.env.CONTACT_EMAIL,
          subject: `[Portfolio] ${subject}`,
          html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
                 <p><strong>Subject:</strong> ${subject}</p>
                 <hr/>
                 <p>${message.replace(/\n/g, '<br>')}</p>`,
        });
      }

      res.json({ success: true, message: 'Message received! I\'ll reply within 24 hours.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  }
);

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── Serve frontend in production ──────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
}

// ── Start ─────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
