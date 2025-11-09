// backend/db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso del DB: env var con fallback locale
const defaultPath = path.join(__dirname, 'data.sqlite');
const dbFile = process.env.DB_FILE || defaultPath;

sqlite3.verbose();
export const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Errore apertura database:', err.message);
  } else {
    console.log(`Database aperto in: ${dbFile}`);
  }
});

// Helper promisificato per eseguire statement
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Migrazioni minime per avvio (estendile se hai altre tabelle)
export async function migrate() {
  // Tabella utenti per login/ruolo master
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  // Aggiungi qui altre CREATE TABLE IF NOT EXISTS se servono
  // es: members, scans, ecc.
}

// Consente: `npm run init:db` (chiama: node db.js init)
if (process.argv[2] === 'init') {
  migrate()
    .then(() => {
      console.log('Migrazioni eseguite.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Errore migrazioni:', err);
      process.exit(1);
    });
}
