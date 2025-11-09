

// ...qui le tue route /api, auth, ecc.







import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, migrate } from './db.js';
import { authRequired, masterOnly } from './middleware.js';
import { register, login } from './auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

migrate();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());

// --- Auth ---
app.post('/api/auth/register', async (req, res) => {
  try { const user = await register(req.body); res.json(user); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try { const data = await login(req.body); res.json(data); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// --- Me ---
app.get('/api/me', authRequired, (req, res) => {
  const u = db.prepare('SELECT id, username, first_name, last_name, email, dob, city, role, qr_token, points FROM users WHERE id = ?').get(req.user.id);
  res.json(u);
});

// --- Tessera (QR) ---
app.get('/api/card', authRequired, (req, res) => {
  const u = db.prepare('SELECT qr_token, points FROM users WHERE id = ?').get(req.user.id);
  res.json({ qrToken: u.qr_token, points: u.points });
});

// --- Storico transazioni ---
app.get('/api/points', authRequired, (req, res) => {
  const rows = db.prepare('SELECT id, delta, by_admin_id, note, created_at FROM points_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 100').all(req.user.id);
  res.json(rows);
});

// --- Admin: regola punti tramite qrToken ---
app.post('/api/admin/adjust', authRequired, masterOnly, (req, res) => {
  const { qrToken, delta, note } = req.body;
  if (!qrToken || !Number.isInteger(delta)) return res.status(400).json({ error: 'qrToken e delta sono obbligatori' });

  const user = db.prepare('SELECT id, points FROM users WHERE qr_token = ?').get(qrToken);
  if (!user) return res.status(404).json({ error: 'Tessera non trovata' });

  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(delta, user.id);
    db.prepare('INSERT INTO points_transactions (user_id, delta, by_admin_id, note) VALUES (?, ?, ?, ?)')
      .run(user.id, delta, req.user.id, note || null);
    return db.prepare('SELECT id, username, points FROM users WHERE id = ?').get(user.id);
  });

  const updated = tx();
  res.json({ userId: updated.id, username: updated.username, points: updated.points });
});

// --- Admin: elenco utenti (facoltativo) ---
app.get('/api/admin/users', authRequired, masterOnly, (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    rows = db.prepare(`SELECT id, username, first_name, last_name, email, points, qr_token FROM users
      WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
      ORDER BY id DESC LIMIT 50`).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    rows = db.prepare('SELECT id, username, first_name, last_name, email, points, qr_token FROM users ORDER BY id DESC LIMIT 50').all();
  }
  res.json(rows);
});

// --- Ping & Home (aggiungi sopra app.listen) ---
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get('/', (req, res) => {
  res.send('API online 🚀  Prova /health oppure chiama le rotte /api/... via client');
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
