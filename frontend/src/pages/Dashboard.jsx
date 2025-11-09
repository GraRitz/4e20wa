import { useEffect, useState } from 'react';
import { api } from '../api';
import QRCard from '../components/QRCard';

export default function Dashboard(){
  const [card, setCard] = useState(null);
  const [tx, setTx] = useState([]);

  useEffect(()=>{
    (async()=>{
      const c = await api.card(); setCard(c);
      const t = await api.points(); setTx(t);
    })();
  },[]);

  if (!card) return <div className="page"><div>Caricamento…</div></div>;

  return (
    <div className="page">
      <div style={{ width: '100%', maxWidth: 720 }}>
        <QRCard qrToken={card.qrToken} points={card.points} />
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Storico punti</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {tx.map(r=> (
              <li key={r.id} style={{ marginBottom: 6, color: '#ddd' }}>
                [{new Date(r.created_at).toLocaleString()}] {r.delta > 0 ? '+' : ''}{r.delta} {r.note ? `– ${r.note}` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
