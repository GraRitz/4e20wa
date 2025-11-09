// backend/db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso del database (fallback locale)
const defaultPath = path.join(__dirname, 'data.sqlite');
const dbFile = process.env.DB_FILE || defaultPath;

// Attiva modalità verbose (log SQL utili in dev)
sqlite3.verbose();

export const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Errore apertura database:', err.message);
  } else {
    console.log(`Database aperto in: ${dbFile}`);
  }
});
