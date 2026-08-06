import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, email, full_name, phone, avatar_url, is_admin, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (err) {
    console.error('Get profiles error:', err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await getOne(
      'SELECT id, email, full_name, phone, avatar_url, is_admin, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (req.user.id !== req.params.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;

    await query('UPDATE users SET is_admin = ? WHERE id = ?', [is_admin ?? false, id]);

    const user = await getOne(
      'SELECT id, email, full_name, phone, avatar_url, is_admin, role, created_at FROM users WHERE id = ?',
      [id]
    );
    res.json({ user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Only super_admin may assign the super_admin role
    if (role === 'super_admin') {
      const caller = req.user;
      if (!caller || caller.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only super admin can assign super_admin role' });
      }
    }

    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    const user = await getOne(
      'SELECT id, email, full_name, phone, avatar_url, is_admin, role, created_at FROM users WHERE id = ?',
      [id]
    );
    res.json({ user });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;
