// frontend/src/api.js

// Base URL per le API
// In produzione (su Render o dominio custom) sarà vuoto → stesso dominio
// In locale puoi impostare VITE_API_BASE=http://localhost:3001 nel file .env del frontend
const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Helper per gestire le richieste API
 * Ogni funzione restituisce una Promise con la risposta JSON già parsata.
 * Se la risposta non è ok (status >= 400), lancia un errore con il messaggio del server.
 */
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', // include cookie JWT
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Errore ${res.status}`);
  }
  return data;
}

export const api = {
  // Login
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Registrazione (se prevista)
  register: (email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Dati profilo utente corrente
  me: () => request('/auth/me'),

  // Logout
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Esempio di endpoint generico GET (es. eventi, tessere)
  get: (path) => request(path),

  // Esempio di endpoint generico POST
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),

  // Esempio di endpoint generico DELETE
  del: (path) => request(path, { method: 'DELETE' }),
};