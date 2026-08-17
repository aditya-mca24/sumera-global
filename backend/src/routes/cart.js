import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await query(`
      SELECT ci.*,
        p.name, p.price, p.slug, p.brand, p.rating, p.compare_price,
        pi.url as primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE ci.user_id = ?
      ORDER BY ci.created_at
    `, [req.user.id]);

    for (const item of items) {
      if (item.variant_id) {
        const variant = await getOne('SELECT * FROM product_variants WHERE id = ?', [item.variant_id]);
        item.variant = variant;
      } else {
        item.variant = null;
      }
      item.product = {
        id: item.product_id,
        name: item.name,
        price: item.price,
        compare_price: item.compare_price,
        slug: item.slug,
        brand: item.brand,
        rating: item.rating,
        images: item.primary_image ? [{ url: item.primary_image, is_primary: true }] : [],
      };
    }

    res.json({ items });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await getOne('SELECT id FROM products WHERE id = ? AND is_active = TRUE', [product_id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await getOne(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
      [req.user.id, product_id, variant_id || null, variant_id || null]
    );

    if (existing) {
      await query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await query(
        'INSERT INTO cart_items (id, user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), req.user.id, product_id, variant_id || null, quantity]
      );
    }

    res.json({ message: 'Added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      await query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.id]);
      return res.json({ message: 'Item removed' });
    }

    await query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, id, req.user.id]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
