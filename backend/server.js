// backend/server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// importa il tuo router API
import apiRouter from './routes/api.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// (Facoltativo) se qualche chiamata sbaglia e fa /api/api/... la correggiamo
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/api/')) req.url = req.url.replace('/api/api/', '/api/');
  next();
});

// 1) API SOLO sotto /api
app.use('/api', apiRouter);

// 2) Static: build del frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// 3) Fallback SPA: QUALSIASI rotta NON-API → index.html (homepage SPA)
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 4) Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on ${PORT}`);
});
