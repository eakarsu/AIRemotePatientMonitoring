import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    if ((process.env.JWT_SECRET || '').length < 32) return res.status(503).json({ error: 'Secure authentication is not configured' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded.tenantId || !decoded.role) throw new Error('missing authorization context');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based access: admin only
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  next();
};

// Role-based: doctor or admin
export const requireDoctor = (req, res, next) => {
  if (!['doctor', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Doctor or admin role required' });
  }
  next();
};
