import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { newQrToken } from './utils.js';

const INS_USERS = db.prepare(`INSERT INTO users
(username, first_name, last_name, email, dob, city, password_hash, role, qr_token)
VALUES (@username, @first_name, @last_name, @email, @dob, @city, @password_hash, @role, @qr_token)`);

const GET_USER_BY_USERNAME = db.prepare('SELECT * FROM users WHERE username = ?');
const GET_USER_BY_EMAIL = db.prepare('SELECT * FROM users WHERE email = ?');
const GET_USER_BY_ID = db.prepare('SELECT id, username, first_name, last_name, email, dob, city, role, qr_token, points, created_at FROM users WHERE id = ?');

export async function register(body) {
  const { username, first_name, last_name, email, dob, city, password } = body;
  if (!username || !first_name || !last_name || !email || !dob || !city || !password) {
    throw new Error('Dati mancanti');
  }
  const exists = GET_USER_BY_USERNAME.get(username) || GET_USER_BY_EMAIL.get(email);
  if (exists) throw new Error('Username o email già usati');

  const password_hash = await bcrypt.hash(password, 10);
  const role = 'user';
  const qr_token = newQrToken();
  const info = INS_USERS.run({ username, first_name, last_name, email, dob, city, password_hash, role, qr_token });
  return GET_USER_BY_ID.get(info.lastInsertRowid);
}

export async function login(body) {
  const { username, password } = body;
  const u = GET_USER_BY_USERNAME.get(username);
  if (!u) throw new Error('Credenziali non valide');
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) throw new Error('Credenziali non valide');
  const token = jwt.sign({ id: u.id, role: u.role, username: u.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: u.id, username: u.username, role: u.role, first_name: u.first_name, last_name: u.last_name, email: u.email, dob: u.dob, city: u.city, qr_token: u.qr_token, points: u.points } };
}
