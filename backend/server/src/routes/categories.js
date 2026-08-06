import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware, optionalAuth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const sql = showAll
      ? 'SELECT * FROM categories ORDER BY display_order'
      : 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order';
    const categories = await query(sql);
    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await getOne('SELECT * FROM categories WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ category });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, image_url, display_order, is_active } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    const catSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await query(
      'INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, catSlug, description || null, image_url || null, display_order || 0, is_active ?? true]
    );

    const category = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json({ category });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image_url, display_order, is_active } = req.body;

    await query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, display_order = ?, is_active = ? WHERE id = ?',
      [name, slug, description, image_url, display_order || 0, is_active ?? true, id]
    );

    const category = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ category });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
