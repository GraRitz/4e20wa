// backend/db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Serve per ottenere il percorso reale di questo file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso locale di default (backend/data.sqlite)
const defaultPath = path.join(__dirname, 'data.sqlite');

// In produzione potrai impostare DB_FILE=/var/data/data.sqlite
const dbFile = process.env.DB_FILE || defaultPath;

// Attiva modalità verbose (debug SQL utile)
sqlite3.verbose();

// Crea e apre il database
export const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Errore apertura database:', err.message);
  } else {
    console.log(`Database connesso: ${dbFile}`);
  }
});