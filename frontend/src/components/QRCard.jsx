import { QRCodeCanvas } from 'qrcode.react';

export default function QRCard({ qrToken, points }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
      <h3>La tua Tessera</h3>
      <p>Punti attuali: <b>{points}</b></p>
      <div style={{ background: '#fff', padding: 12, display: 'inline-block' }}>
        <QRCodeCanvas value={qrToken} size={220} includeMargin={true} />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Mostra questo QR all’operatore per caricare/sottrarre punti.</p>
    </div>
  );
}
