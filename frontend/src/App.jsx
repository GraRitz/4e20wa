import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminScanner from './pages/AdminScanner';
import TopBar from './components/TopBar';

export default function App(){
  const { user, loading } = useAuth();
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(()=>{
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  },[]);

  if (loading) return <div className="page"><div>Caricamento…</div></div>;

  let Page = null;
  if (route.startsWith('#/login')) Page = <Login/>;
  else if (route.startsWith('#/register')) Page = <Register/>;
  else if (route.startsWith('#/dashboard')) Page = user ? <Dashboard/> : <Home/>;
  else if (route.startsWith('#/scanner')) Page = user?.role === 'master' ? <AdminScanner/> : <Home/>;
  else Page = <Home/>;

  return (
    <>
      <TopBar />
      {Page}
    </>
  );
}
