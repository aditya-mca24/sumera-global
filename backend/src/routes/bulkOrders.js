import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware, optionalAuth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT * FROM bulk_orders';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const orders = await query(sql, params);
    for (const order of orders) {
      if (typeof order.sizes === 'string') {
        try { order.sizes = JSON.parse(order.sizes); } catch { order.sizes = []; }
      }
      if (typeof order.colors === 'string') {
        try { order.colors = JSON.parse(order.colors); } catch { order.colors = []; }
      }
    }

    res.json({ orders });
  } catch (err) {
    console.error('Get bulk orders error:', err);
    res.status(500).json({ error: 'Failed to fetch bulk orders' });
  }
});

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, product_type, quantity, sizes, colors, customization, delivery_location, notes } = req.body;

    if (!contact_name || !email || !phone || !product_type || !quantity || !delivery_location) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const id = uuidv4();
    await query(
      `INSERT INTO bulk_orders (id, user_id, company_name, contact_name, email, phone, product_type, quantity, sizes, colors, customization, delivery_location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user?.id || null, company_name || null, contact_name, email, phone, product_type, quantity, JSON.stringify(sizes || []), JSON.stringify(colors || []), customization || null, delivery_location, notes || null]
    );

    res.status(201).json({ message: 'Bulk order submitted', id });
  } catch (err) {
    console.error('Create bulk order error:', err);
    res.status(500).json({ error: 'Failed to submit bulk order' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quotation_amount } = req.body;

    await query('UPDATE bulk_orders SET status = ?, quotation_amount = ? WHERE id = ?', [status, quotation_amount || null, id]);
    const order = await getOne('SELECT * FROM bulk_orders WHERE id = ?', [id]);

    if (typeof order.sizes === 'string') {
      try { order.sizes = JSON.parse(order.sizes); } catch { order.sizes = []; }
    }
    if (typeof order.colors === 'string') {
      try { order.colors = JSON.parse(order.colors); } catch { order.colors = []; }
    }

    res.json({ order });
  } catch (err) {
    console.error('Update bulk order error:', err);
    res.status(500).json({ error: 'Failed to update bulk order' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM bulk_orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Bulk order deleted' });
  } catch (err) {
    console.error('Delete bulk order error:', err);
    res.status(500).json({ error: 'Failed to delete bulk order' });
  }
});

export default router;
