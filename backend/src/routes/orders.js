import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await query(`
      SELECT o.* FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    for (const order of orders) {
      order.items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      if (typeof order.shipping_address === 'string') {
        try { order.shipping_address = JSON.parse(order.shipping_address); } catch {}
      }
    }

    res.json({ orders });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT o.*, u.email, u.full_name FROM orders o LEFT JOIN users u ON o.user_id = u.id';
    const params = [];

    if (status) {
      sql += ' WHERE o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const orders = await query(sql, params);
    for (const order of orders) {
      order.items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      if (typeof order.shipping_address === 'string') {
        try { order.shipping_address = JSON.parse(order.shipping_address); } catch {}
      }
    }

    res.json({ orders });
  } catch (err) {
    console.error('Get admin orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, shipping_address, payment_method, coupon_code, notes, subtotal, discount, shipping, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    const orderId = uuidv4();

    await query(
      `INSERT INTO orders (id, user_id, status, payment_method, payment_status, subtotal, discount, shipping, total, coupon_code, shipping_address, notes)
       VALUES (?, ?, 'pending', ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, req.user.id, payment_method || null, subtotal, discount || 0, shipping || 0, total, coupon_code || null, JSON.stringify(shipping_address), notes || null]
    );

    for (const item of items) {
      await query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, variant_size, variant_color, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), orderId, item.product_id || null, item.product_name, item.product_image || null, item.variant_size || null, item.variant_color || null, item.quantity, item.unit_price, item.total_price]
      );
    }

    await query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    res.status(201).json({ order: { id: orderId } });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    if (status) {
      await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }
    if (payment_status) {
      await query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
    }

    res.json({ message: 'Order updated' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await getOne('SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = TRUE)', [req.params.id, req.user.id, req.user.is_admin]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    if (typeof order.shipping_address === 'string') {
      try { order.shipping_address = JSON.parse(order.shipping_address); } catch {}
    }
    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
