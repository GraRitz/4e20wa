import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';

export default function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '', email: '', dob: '', city: '', password: ''
  });
  const [err, setErr] = useState('');

  function upd(k, v){ setForm(s => ({...s, [k]: v})); }

  async function submit(e){
    e.preventDefault(); setErr('');
    try {
      await api.register(form);
      await login(form.username, form.password); // auto-login
      window.location.hash = '#/';               // torna alla Home
    } catch(e){
      setErr(e.message);
    }
  }

  const go = (hash) => () => { window.location.hash = hash; };

  return (
    <div className="page">
      <form className="card form" onSubmit={submit}>
        <h2 style={{ marginBottom: 10 }}>Registrati</h2>

        <div className="field"><label>Username</label>
          <input value={form.username} onChange={e=>upd('username', e.target.value)} required />
        </div>
        <div className="field"><label>Nome</label>
          <input value={form.first_name} onChange={e=>upd('first_name', e.target.value)} required />
        </div>
        <div className="field"><label>Cognome</label>
          <input value={form.last_name} onChange={e=>upd('last_name', e.target.value)} required />
        </div>
        <div className="field"><label>Email</label>
          <input type="email" value={form.email} onChange={e=>upd('email', e.target.value)} required />
        </div>
        <div className="field"><label>Data di nascita</label>
          <input type="date" value={form.dob} onChange={e=>upd('dob', e.target.value)} required />
        </div>
        <div className="field"><label>Città</label>
          <input value={form.city} onChange={e=>upd('city', e.target.value)} required />
        </div>
        <div className="field"><label>Password</label>
          <input type="password" value={form.password} onChange={e=>upd('password', e.target.value)} required />
        </div>

        {err && <div style={{ color: 'crimson', marginTop: 6 }}>{err}</div>}

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={go('#/')}>← Home</button>
          <button type="submit" className="btn">Crea account</button>
        </div>
      </form>
    </div>
  );
}
