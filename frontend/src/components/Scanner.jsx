// frontend/src/pages/Scanner.jsx
import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scanner({ onScan }) {
  useEffect(() => {
    const qrRegionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(qrRegionId);

    // ✅ Preferisci fotocamera posteriore ("environment")
    const cameraConfig = { facingMode: { exact: 'environment' } };

    // Se fallisce (es. desktop o device senza doppia cam), usiamo fallback
    const startScanner = async () => {
      try {
        await html5QrCode.start(
          cameraConfig,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            console.log('QR code:', decodedText);
            if (onScan) onScan(decodedText);
          },
          (err) => console.warn('QR scan error:', err)
        );
      } catch (err) {
        console.warn('Fotocamera posteriore non disponibile, uso default.');
        // fallback → usa qualsiasi camera disponibile
        await html5QrCode.start(
          { facingMode: 'user' },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            console.log('QR code:', decodedText);
            if (onScan) onScan(decodedText);
          }
        );
      }
    };

    startScanner();

    return () => {
      html5QrCode.stop().catch(() => {});
      html5QrCode.clear();
    };
  }, [onScan]);

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-lg mb-2">Scanner tessere</h2>
      <div id="qr-reader" style={{ width: '300px', height: '300px' }}></div>
    </div>
  );
}
