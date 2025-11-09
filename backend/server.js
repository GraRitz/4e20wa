// backend/server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Se qualche chiamata accidentalmente fa /api/api/... la riscriviamo in /api/...
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/api/')) req.url = req.url.replace('/api/api/', '/api/');
  next();
});

// Proviamo a caricare un router esterno, ma se non esiste andiamo avanti lo stesso
let apiRouter = null;
try {
  // Se in futuro aggiungi un router, mettilo in backend/routes/api.js
  const mod = await import('./routes/api.js');
  apiRouter = mod.default || mod;
  console.log('Loaded API router from ./routes/api.js');
} catch (err) {
  // Nessun router esterno: usiamo un router "vuoto" e definiamo almeno /api/health
  console.warn('No ./routes/api.js found; continuing without external router.');
  apiRouter = express.Router();
  apiRouter.get('/health', (_req, res) => res.json({ ok: true }));
}

// Montiamo le API sotto /api
app.use('/api', apiRouter);

// Static: serve la build del frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// SPA fallback: qualsiasi rotta NON-API → index.html (homepage React)
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Porta (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on ${PORT}`);
});
