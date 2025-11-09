import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, username }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function masterOnly(req, res, next) {
  if (req.user?.role !== 'master') return res.status(403).json({ error: 'Master only' });
  next();
}
