import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await query(`
      SELECT wi.*, p.name, p.price, p.slug, p.brand, p.rating, p.compare_price
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.user_id = ?
      ORDER BY wi.created_at DESC
    `, [req.user.id]);

    for (const item of items) {
      const images = await query('SELECT url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order LIMIT 1', [item.product_id]);
      item.product = {
        id: item.product_id,
        name: item.name,
        price: item.price,
        compare_price: item.compare_price,
        slug: item.slug,
        brand: item.brand,
        rating: item.rating,
        images,
      };
    }

    res.json({ items });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const existing = await getOne('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    if (existing) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }

    await query('INSERT INTO wishlist_items (id, user_id, product_id) VALUES (?, ?, ?)', [uuidv4(), req.user.id, product_id]);
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/:product_id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.product_id]);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

export default router;
