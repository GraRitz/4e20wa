// backend/db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso DB: ENV var con fallback locale al file nella cartella backend
// Su Render imposta DB_FILE=/var/data/data.sqlite per la persistenza
const defaultPath = path.join(__dirname, 'data.sqlite');
const dbFile = process.env.DB_FILE || defaultPath;

sqlite3.verbose();
export const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error('Errore apertura database:', err.message);
  else console.log(`Database aperto in: ${dbFile}`);
});

// --- Helpers promisificati ---------------------------------------------------
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

async function hasTable(name) {
  const rows = await all(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [name]
  );
  return rows.length > 0;
}

async function hasColumn(table, col) {
  const rows = await all(`PRAGMA table_info(${table});`);
  return rows.some((r) => r.name === col);
}

async function ensureColumn(table, col, definitionSql) {
  const exists = await hasColumn(table, col);
  if (!exists) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${col} ${definitionSql};`);
  }
}

async function ensureUniqueIndex(name, table, columnsCsv) {
  const rows = await all(
    `SELECT name FROM sqlite_master WHERE type='index' AND name=?`,
    [name]
  );
  if (rows.length === 0) {
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS ${name} ON ${table} (${columnsCsv});`);
  }
}

// --- Migrazioni --------------------------------------------------------------
export async function migrate() {
  // 1) Crea "users" se non esiste con schema completo
  const usersExists = await hasTable('users');
  if (!usersExists) {
    await run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        username TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        first_name TEXT,
        last_name TEXT,
        display_name TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME
      )
    `);
  } else {
    // 2) DB esistente: assicurati che tutte le colonne richieste ci siano
    await ensureColumn('users', 'email',        'TEXT');
    await ensureColumn('users', 'username',     'TEXT');
    await ensureColumn('users', 'password',     'TEXT NOT NULL');
    await ensureColumn('users', 'role',         "TEXT NOT NULL DEFAULT 'user'");
    await ensureColumn('users', 'first_name',   'TEXT');
    await ensureColumn('users', 'last_name',    'TEXT');
    await ensureColumn('users', 'display_name', 'TEXT');
    await ensureColumn('users', 'is_active',    'INTEGER NOT NULL DEFAULT 1');
    await ensureColumn('users', 'created_at',   'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
    await ensureColumn('users', 'updated_at',   'DATETIME');
  }

  // 3) Indici unici
  await ensureUniqueIndex('idx_users_email_unique', 'users', 'email');
  await ensureUniqueIndex('idx_users_username_unique', 'users', 'username');

  // 4) Backfill display_name se manca (first+last -> username -> email)
  await run(`
    UPDATE users
    SET display_name = COALESCE(
      NULLIF(TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')), ''),
      username,
      email,
      display_name
    )
    WHERE display_name IS NULL;
  `);

  // 5) Backfill username se nullo (parte locale dell'email)
  await run(`
    UPDATE users
    SET username = COALESCE(
      username,
      CASE
        WHEN email IS NOT NULL AND instr(email,'@') > 1
        THEN substr(email, 1, instr(email,'@') - 1)
        ELSE NULL
      END
    )
    WHERE username IS NULL;
  `);
}

// Permette: `node db.js init`
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
