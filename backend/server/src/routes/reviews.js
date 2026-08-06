import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/product/:product_id', async (req, res) => {
  try {
    const reviews = await query(
      'SELECT * FROM reviews WHERE product_id = ? AND is_approved = TRUE ORDER BY created_at DESC',
      [req.params.product_id]
    );
    res.json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, rating, title, body } = req.body;
    if (!product_id || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existing = await getOne('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?', [product_id, req.user.id]);
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const user = await getOne('SELECT full_name FROM users WHERE id = ?', [req.user.id]);

    await query(
      'INSERT INTO reviews (id, product_id, user_id, user_name, rating, title, body) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), product_id, req.user.id, user.full_name || 'Anonymous', rating, title || null, body || null]
    );

    const reviews = await query('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ? AND is_approved = TRUE', [product_id]);
    await query('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [reviews[0].avg || 0, reviews[0].count, product_id]);

    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { approved, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id';
    const params = [];

    if (approved !== undefined) {
      sql += ' WHERE r.is_approved = ?';
      params.push(approved === 'true');
    }

    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const reviews = await query(sql, params);
    res.json({ reviews });
  } catch (err) {
    console.error('Get admin reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.put('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { approved = true } = req.body;
    await query('UPDATE reviews SET is_approved = ? WHERE id = ?', [approved, req.params.id]);
    res.json({ message: 'Review updated' });
  } catch (err) {
    console.error('Approve review error:', err);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
