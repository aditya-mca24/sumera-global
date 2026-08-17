import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const coupons = await query('SELECT id, code, type, value, min_order_value FROM coupons WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())');
    res.json({ coupons });
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = await getOne('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [code.toUpperCase()]);
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ error: 'Coupon has reached maximum uses' });
    }

    if (subtotal < coupon.min_order_value) {
      return res.status(400).json({ error: `Minimum order value is ₹${coupon.min_order_value}` });
    }

    let discount;
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }

    res.json({ coupon, discount: Math.min(discount, subtotal) });
  } catch (err) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupons = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ coupons });
  } catch (err) {
    console.error('Get admin coupons error:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code, type, value, min_order_value, max_uses, expires_at } = req.body;
    if (!code || !type || !value) {
      return res.status(400).json({ error: 'Code, type, and value are required' });
    }

    const id = uuidv4();
    await query(
      'INSERT INTO coupons (id, code, type, value, min_order_value, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, code.toUpperCase(), type, value, min_order_value || 0, max_uses || null, expires_at || null]
    );

    const coupon = await getOne('SELECT * FROM coupons WHERE id = ?', [id]);
    res.status(201).json({ coupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, min_order_value, max_uses, expires_at, is_active } = req.body;

    await query(
      'UPDATE coupons SET code = ?, type = ?, value = ?, min_order_value = ?, max_uses = ?, expires_at = ?, is_active = ? WHERE id = ?',
      [code?.toUpperCase(), type, value, min_order_value || 0, max_uses || null, expires_at || null, is_active ?? true, id]
    );

    const coupon = await getOne('SELECT * FROM coupons WHERE id = ?', [id]);
    res.json({ coupon });
  } catch (err) {
    console.error('Update coupon error:', err);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

export default router;
