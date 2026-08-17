import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const addresses = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at', [req.user.id]);
    res.json({ addresses });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone, line1, line2, city, state, pincode, country, is_default } = req.body;
    if (!full_name || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    if (is_default) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }

    const id = uuidv4();
    await query(
      'INSERT INTO addresses (id, user_id, full_name, phone, line1, line2, city, state, pincode, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, full_name, phone, line1, line2 || null, city, state, pincode, country || 'India', is_default || false]
    );

    const address = await getOne('SELECT * FROM addresses WHERE id = ?', [id]);
    res.status(201).json({ address });
  } catch (err) {
    console.error('Create address error:', err);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, line1, line2, city, state, pincode, country, is_default } = req.body;

    if (is_default) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }

    await query(
      'UPDATE addresses SET full_name = ?, phone = ?, line1 = ?, line2 = ?, city = ?, state = ?, pincode = ?, country = ?, is_default = ? WHERE id = ? AND user_id = ?',
      [full_name, phone, line1, line2 || null, city, state, pincode, country || 'India', is_default || false, id, req.user.id]
    );

    const address = await getOne('SELECT * FROM addresses WHERE id = ?', [id]);
    res.json({ address });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
