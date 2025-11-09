import { useState } from 'react';
import Scanner from '../components/Scanner';
import { api } from '../api';

export default function AdminScanner(){
  const [last, setLast] = useState(null);
  const [delta, setDelta] = useState(1);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  async function onScan(qrToken){
    try{
      setErr('');
      const res = await api.adminAdjust({ qrToken, delta: Number(delta), note });
      setLast({ qrToken, res });
    } catch(e){ setErr(e.message); }
  }

  return (
    <div className="page">
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 12 }}>Scanner Tessere (Master)</h2>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <label>Delta punti
              <input
                type="number"
                value={delta}
                onChange={e=>setDelta(e.target.value)}
                style={{ width: 120, marginLeft: 8 }}
              />
            </label>
            <label>Nota
              <input
                value={note}
                onChange={e=>setNote(e.target.value)}
                placeholder="es. ingresso evento"
                style={{ width: 220, marginLeft: 8 }}
              />
            </label>
          </div>
        </div>

        <Scanner onScan={onScan} />

        {err && <div style={{ color: 'crimson', marginTop: 8 }}>{err}</div>}
        {last && (
          <div className="card" style={{ marginTop: 16 }}>
            <div>Scansionato token: <code>{last.qrToken}</code></div>
            <div>Utente aggiornato: <b>{last.res.username}</b> – Punti: <b>{last.res.points}</b></div>
          </div>
        )}
      </div>
    </div>
  );
}
