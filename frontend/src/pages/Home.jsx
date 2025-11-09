import { useAuth } from '../auth';
import logo from '../assets/logo.png';

export default function Home() {
  const { user } = useAuth();
  const go = (hash) => () => { window.location.hash = hash; };

  return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center', maxWidth: 720, width: '100%' }}>
        <img src={logo} alt="Logo organizzazione" className="logo" />
        <h1>It's the way to be!</h1>
        {user && (
          <h2 className="welcome">Benvenuto, {user.first_name || user.username}!</h2>
        )}
        <p className="subtitle">Gestisci la tua tessera punti in modo semplice.</p>

        <div className="btns">
          {user ? (
            <>
              <button onClick={go('#/dashboard')} className="btn">
                🎟️ Visualizza la tua tessera
              </button>
              {user.role === 'master' && (
                <button onClick={go('#/scanner')} className="btn btn-outline">
                  📷 Scanner (Master)
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={go('#/login')} className="btn">🔐 Accedi</button>
              <button onClick={go('#/register')} className="btn btn-outline">📝 Registrati</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
