// frontend/src/api.js

// Base URL per le API:
// - In produzione (Render/domino custom) resta vuoto → stesso dominio
// - In locale imposta VITE_API_BASE=http://localhost:3001 nel frontend/.env
const API_BASE = import.meta.env.VITE_API_BASE || '';

// ---- Gestione token opzionale (per chi usa Bearer) ----
// Compatibile con build SSR: tocchiamo localStorage solo in browser
let memoryToken = null;

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function setToken(token) {
  memoryToken = token || null;
  if (hasWindow()) {
    if (token) window.localStorage.setItem('token', token);
    else window.localStorage.removeItem('token');
  }
}

export function getToken() {
  if (memoryToken) return memoryToken;
  if (hasWindow()) return window.localStorage.getItem('token');
  return null;
}

export function clearToken() {
  setToken(null);
}

// ---- Helper fetch ----
async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  // Se stai usando Bearer token, lo aggiungiamo.
  const t = getToken();
  if (t && !headers.Authorization) {
    headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include', // per cookie-JWT (se usi i cookie)
    ...options,
    headers,
  });

  // Proviamo a leggere JSON, se non è JSON ritorniamo testo vuoto
  let data = {};
  try {
    data = await res.json();
  } catch (_e) {
    // ignore
  }

  if (!res.ok) {
    throw new Error(data?.message || `Errore ${res.status}`);
  }
  return data;
}

// ---- API di comodo ----
export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Generiche
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};