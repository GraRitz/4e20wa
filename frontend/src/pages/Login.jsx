import { useState } from 'react';
import { useAuth } from '../auth';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      setErr('');
      await login(username, password);
      window.location.hash = '#/'; // torna alla Home
    } catch (e) {
      setErr(e.message);
    }
  }

  const go = (hash) => () => { window.location.hash = hash; };

  return (
    <div className="page">
      <form className="card form" onSubmit={submit}>
        <h2 style={{ marginBottom: 10 }}>Accedi</h2>
        <div className="field">
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {err && <div style={{ color: 'crimson', marginTop: 6 }}>{err}</div>}

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={go('#/')}>← Home</button>
          <button type="submit" className="btn">Entra</button>
        </div>
      </form>
    </div>
  );
}
