// backend/db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso DB: env var con fallback locale
const defaultPath = path.join(__dirname, 'data.sqlite');
const dbFile = process.env.DB_FILE || defaultPath;

sqlite3.verbose();
export const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error('Errore apertura database:', err.message);
  else console.log(`Database aperto in: ${dbFile}`);
});

// Promisified helpers
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}
async function hasColumn(table, col) {
  const rows = await all(`PRAGMA table_info(${table});`);
  return rows.some((r) => r.name === col);
}

// Migrazioni
export async function migrate() {
  // 1) Crea tabella users se non esiste con tutte le colonne attese
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      username TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2) Se esiste ma manca "username", la aggiungiamo (DB già creati)
  const hasUserNameCol = await hasColumn('users', 'username');
  if (!hasUserNameCol) {
    await run(`ALTER TABLE users ADD COLUMN username TEXT;`);
    // opzionale: prova a popolare username derivandolo dalla parte locale dell'email
    await run(`
      UPDATE users
      SET username = COALESCE(username, substr(email, 1, instr(email || '@','@') - 1))
      WHERE email IS NOT NULL;
    `);
  }

  // 3) Se manca "role", aggiungilo (per sicurezza su DB vecchi)
  const hasRoleCol = await hasColumn('users', 'role');
  if (!hasRoleCol) {
    await run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';`);
  }
}

// Permette: `npm run init:db` → `node db.js init`
if (process.argv[2] === 'init') {
  migrate()
    .then(() => {
      console.log('Migrazioni eseguite.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Errore migrazioni:', err);
      process.exit(1);
    });
}