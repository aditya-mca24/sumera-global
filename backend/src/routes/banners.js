import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const sql = showAll
      ? 'SELECT * FROM banners ORDER BY display_order'
      : 'SELECT * FROM banners WHERE is_active = TRUE ORDER BY display_order';
    const banners = await query(sql);
    res.json({ banners });
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, subtitle, image_url, link_url, button_text, display_order } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    const id = uuidv4();
    await query(
      'INSERT INTO banners (id, title, subtitle, image_url, link_url, button_text, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, subtitle || null, image_url, link_url || null, button_text || null, display_order || 0]
    );

    const banner = await getOne('SELECT * FROM banners WHERE id = ?', [id]);
    res.status(201).json({ banner });
  } catch (err) {
    console.error('Create banner error:', err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image_url, link_url, button_text, display_order, is_active } = req.body;

    await query(
      'UPDATE banners SET title = ?, subtitle = ?, image_url = ?, link_url = ?, button_text = ?, display_order = ?, is_active = ? WHERE id = ?',
      [title, subtitle, image_url, link_url, button_text, display_order || 0, is_active ?? true, id]
    );

    const banner = await getOne('SELECT * FROM banners WHERE id = ?', [id]);
    res.json({ banner });
  } catch (err) {
    console.error('Update banner error:', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    console.error('Delete banner error:', err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

export default router;
