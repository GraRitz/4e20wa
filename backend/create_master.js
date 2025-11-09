// backend/create_master.js
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso del DB (usa la variabile d'ambiente se esiste)
const defaultPath = path.join(__dirname, 'data.sqlite');
const dbFile = process.env.DB_FILE || defaultPath;

sqlite3.verbose();
const db = new sqlite3.Database(dbFile);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Uso corretto: node create_master.js <email> <password>');
  process.exit(1);
}

(async () => {
  const hashed = await bcrypt.hash(password, 10);

  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`
    );

    const stmt = db.prepare(
      'INSERT OR REPLACE INTO users (email, password, role) VALUES (?, ?, ?)'
    );

    stmt.run(email, hashed, 'master', (err) => {
      if (err) {
        console.error('Errore durante la creazione utente master:', err.message);
      } else {
        console.log(`Utente master creato/aggiornato: ${email}`);
      }
      db.close();
    });

    stmt.finalize();
  });
})();
