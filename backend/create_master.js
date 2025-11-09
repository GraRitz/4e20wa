import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database(process.env.DATABASE_FILE || './data.sqlite');

const username = '4e20';
const password = 'master'; // <-- puoi cambiare la password qui
const email = 'master@example.com';

const passHash = await bcrypt.hash(password, 10);

db.prepare(
  `INSERT INTO users 
   (username, first_name, last_name, email, dob, city, password_hash, role, qr_token, points) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
).run(
  username,
  'Master',
  'Admin',
  email,
  '1990-01-01',
  'Roma',
  passHash,
  'master',
  'qr_mastertoken'
);

console.log(`Utente master creato:\n  username: ${username}\n  password: ${password}`);
