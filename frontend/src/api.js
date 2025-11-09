// frontend/src/api.js
async function requestWithFallback(method, paths, payload) {
  const body = payload ? JSON.stringify(payload) : undefined;
  let lastErr = null;

  for (const p of paths) {
    try {
      const res = await fetch(p, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ok anche se non usi cookie; altrimenti rimuovi
        body,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }
      // tenta json, altrimenti string
      try { return await res.json(); } catch { return {}; }
    } catch (e) {
      lastErr = e;
      // prova il prossimo path
    }
  }
  throw lastErr || new Error('Request failed');
}

export function apiPostRegister(data) {
  // TENTA questi endpoint in ordine finché uno risponde ok
  return requestWithFallback('POST', [
    '/api/register',
    '/api/auth/register',
    '/api/users/register',
  ], data);
}

export function apiPostLogin(data) {
  return requestWithFallback('POST', [
    '/api/login',
    '/api/auth/login',
    '/api/users/login',
  ], data);
}

export function apiGetHealth() {
  return requestWithFallback('GET', ['/api/health'], null);
}
