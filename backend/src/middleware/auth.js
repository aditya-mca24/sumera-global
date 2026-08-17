import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function adminMiddleware(req, res, next) {
  try {
    const { getOne } = await import('../config/database.js');
    const user = await getOne('SELECT is_admin, role FROM users WHERE id = ?', [req.user.id]);
    if (!user || !(user.is_admin || user.role === 'super_admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      req.user = decoded;
    } catch {}
  }
  next();
}

export function generateToken(user) {
  const payload = { id: user.id, email: user.email, is_admin: user.is_admin };
  if (user.role) payload.role = user.role;
  return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
