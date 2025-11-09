// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { apiPostRegister } from '../api'; // aggiorna il path se il file è altrove

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr(''); setOk('');
    const form = new FormData(e.currentTarget);
    const payload = {
      // Assicurati che gli <input> abbiano questi name:
      name: form.get('name') || form.get('username') || '',
      email: form.get('email') || '',
      password: form.get('password') || '',
    };
    try {
      await apiPostRegister(payload);
      setOk('Registrazione completata! Ora puoi accedere.');
      // opzionale: redirect dopo una pausa
      // setTimeout(() => window.location.assign('/login'), 800);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Registrati</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input name="name" placeholder="Nome" className="border p-2 rounded" required />
        <input name="email" type="email" placeholder="Email" className="border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" className="border p-2 rounded" required />
        {err && <p className="text-red-500" role="alert">{err}</p>}
        {ok && <p className="text-green-600">{ok}</p>}
        <button type="submit" disabled={loading} className="p-2 rounded border">
          {loading ? 'Invio...' : 'Registrati'}
        </button>
      </form>
    </main>
  );
}
