import { useAuth } from '../auth';

export default function TopBar() {
  const { user, logout } = useAuth();

  const go = (hash) => () => { window.location.hash = hash; };

  return (
    <div className="topbar">
      <div className="actions">
        <button className="btn-ghost" onClick={go('#/')}>🏠 Home</button>
      </div>
      <div className="actions">
        {user ? (
          <button
            className="btn-ghost"
            onClick={() => { logout(); window.location.hash = '#/'; }}
            title="Esci"
          >
            🚪 Esci
          </button>
        ) : null}
      </div>
    </div>
  );
}
