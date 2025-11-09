// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { apiPostLogin } from '../api'; // aggiorna il path se il file è altrove

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get('email') || '',
      password: form.get('password') || '',
    };
    try {
      await apiPostLogin(payload);
      // redirect alla homepage o dashboard
      window.location.assign('/');
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Accedi</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input name="email" type="email" placeholder="Email" className="border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" className="border p-2 rounded" required />
        {err && <p className="text-red-500" role="alert">{err}</p>}
        <button type="submit" disabled={loading} className="p-2 rounded border">
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
      </form>
    </main>
  );
}
