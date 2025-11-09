// backend/db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso DB: su Render usa DB_FILE=/var/data/data.sqlite
const defaultPath = path.join(__dirname, 'data.sqlite');
const dbFile = process.env.DB_FILE || defaultPath;

sqlite3.verbose();
export const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error('Errore apertura database:', err.message);
  else console.log(`Database aperto in: ${dbFile}`);
});

// ---------- helpers promisificati ----------
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

/**
 * Aggiunge la colonna se manca, **senza NOT NULL** (per compatibilità),
 * poi opzionalmente esegue un backfill sugli esistenti.
 */
async function ensureColumn(table, col, typeSql, backfillSql = null) {
  const exists = await hasColumn(table, col);
  if (!exists) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${col} ${typeSql};`);
    if (backfillSql) {
      await run(backfillSql);
    }
  }
}

async function ensureIndex(name, sqlCreateIfNotExists) {
  const rows = await all(
    `SELECT name FROM sqlite_master WHERE type IN ('index','trigger') AND name=?`,
    [name]
  );
  if (rows.length === 0) {
    await run(sqlCreateIfNotExists);
  }
}

// ---------- migrazioni ----------
export async function migrate() {
  // USERS
  const usersExists = await hasTable('users');
  if (!usersExists) {
    // Schema "pulito" per DB nuovi: si possono usare NOT NULL e DEFAULT
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
        dob TEXT,
        phone TEXT,
        points INTEGER NOT NULL DEFAULT 0,
        card_id TEXT UNIQUE,
        qr_token TEXT UNIQUE,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_scan_at DATETIME,
        meta TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME
      )
    `);
  } else {
    // Su DB esistenti: niente NOT NULL nelle ALTER, usiamo DEFAULT e backfill
    await ensureColumn('users', 'email',        'TEXT');
    await ensureColumn('users', 'username',     'TEXT',
      `UPDATE users
       SET username = COALESCE(
         username,
         CASE
           WHEN email IS NOT NULL AND instr(email,'@')>1
             THEN substr(email,1,instr(email,'@')-1)
           ELSE NULL
         END
       )
       WHERE username IS NULL;`
    );
    await ensureColumn('users', 'password',     'TEXT'); // vincolo gestito a livello applicativo
    await ensureColumn('users', 'role',         "TEXT DEFAULT 'user'",
      `UPDATE users SET role = COALESCE(role,'user') WHERE role IS NULL;`
    );

    await ensureColumn('users', 'first_name',   'TEXT');
    await ensureColumn('users', 'last_name',    'TEXT');
    await ensureColumn('users', 'display_name', 'TEXT',
      `UPDATE users
       SET display_name = COALESCE(
         NULLIF(TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')), ''),
         username,
         email,
         display_name
       )
       WHERE display_name IS NULL;`
    );

    await ensureColumn('users', 'dob',          'TEXT');
    await ensureColumn('users', 'phone',        'TEXT');
    await ensureColumn('users', 'points',       'INTEGER DEFAULT 0',
      `UPDATE users SET points = 0 WHERE points IS NULL;`
    );
    await ensureColumn('users', 'card_id',      'TEXT');
    await ensureColumn('users', 'qr_token',     'TEXT');
    await ensureColumn('users', 'is_active',    'INTEGER DEFAULT 1',
      `UPDATE users SET is_active = COALESCE(is_active,1) WHERE is_active IS NULL;`
    );
    await ensureColumn('users', 'last_scan_at', 'DATETIME');
    await ensureColumn('users', 'meta',         'TEXT');
    await ensureColumn('users', 'created_at',   'DATETIME DEFAULT (CURRENT_TIMESTAMP)',
      `UPDATE users SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;`
    );
    await ensureColumn('users', 'updated_at',   'DATETIME');
  }

  // Indici/unique
  await ensureIndex(
    'idx_users_email_unique',
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);`
  );
  await ensureIndex(
    'idx_users_username_unique',
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username);`
  );
  await ensureIndex(
    'idx_users_card_id_unique',
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_card_id_unique ON users(card_id);`
  );
  await ensureIndex(
    'idx_users_qr_token_unique',
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_qr_token_unique ON users(qr_token);`
  );

  // SCANS
  const scansExists = await hasTable('scans');
  if (!scansExists) {
    await run(`
      CREATE TABLE scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        admin_id INTEGER,
        delta_points INTEGER NOT NULL DEFAULT 0,
        note TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await ensureIndex(
      'idx_scans_user_id',
      `CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);`
    );
    await ensureIndex(
      'idx_scans_created_at',
      `CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);`
    );
  }
}

// Permette: `node db.js init`
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
