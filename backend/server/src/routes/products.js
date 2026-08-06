import { Router } from 'express';
import { query, getOne } from '../config/database.js';
import { authMiddleware, adminMiddleware, optionalAuth } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, filter, min, max, sort = 'newest', page = 1, limit = 12, q, all } = req.query;
    const showAll = all === 'true';

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${showAll ? '1=1' : 'p.is_active = TRUE'}
    `;
    const params = [];
    const filters = [];
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (category) {
      const cat = await getOne('SELECT id FROM categories WHERE slug = ?', [category]);
      if (cat) {
        filters.push('p.category_id = ?');
        params.push(cat.id);
      }
    }

    if (q) {
      filters.push('(p.name LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filter === 'new') filters.push('p.is_new_arrival = TRUE');
    if (filter === 'bestseller') filters.push('p.is_best_seller = TRUE');
    if (filter === 'featured') filters.push('p.is_featured = TRUE');

    if (min) {
      filters.push('p.price >= ?');
      params.push(parseFloat(min));
    }
    if (max) {
      filters.push('p.price <= ?');
      params.push(parseFloat(max));
    }

    if (filters.length > 0) {
      sql += ' AND ' + filters.join(' AND ');
    }

    const sortMap = {
      newest: 'p.created_at DESC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating: 'p.rating DESC',
      popular: 'p.review_count DESC',
    };
    sql += ` ORDER BY ${sortMap[sort] || 'p.created_at DESC'}`;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = await query(sql, params);

    for (const product of products) {
      const images = await query('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order', [product.id]);
      const variants = await query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
      product.images = images;
      product.variants = variants;
      product.category = product.category_id ? {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug,
      } : null;
      if (typeof product.tags === 'string') {
        try { product.tags = JSON.parse(product.tags); } catch { product.tags = []; }
      }
    }

    let countSql = showAll
      ? 'SELECT COUNT(*) as total FROM products p WHERE 1=1'
      : 'SELECT COUNT(*) as total FROM products p WHERE p.is_active = TRUE';
    if (filters.length > 0) {
      countSql += ' AND ' + filters.join(' AND ');
    }
    const countParams = params.slice(0, -2);
    const [{ total }] = await query(countSql, countParams);

    res.json({ products, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let product;
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      product = await getOne(`
        SELECT p.*, c.name as category_name, c.slug as category_slug, c.id as category_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `, [id]);
    } else {
      product = await getOne(`
        SELECT p.*, c.name as category_name, c.slug as category_slug, c.id as category_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `, [id]);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = await query('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order, is_primary DESC', [product.id]);
    const variants = await query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);

    product.images = images;
    product.variants = variants;
    product.category = product.category_id ? {
      id: product.category_id,
      name: product.category_name,
      slug: product.category_slug,
    } : null;

    if (typeof product.tags === 'string') {
      try { product.tags = JSON.parse(product.tags); } catch { product.tags = []; }
    }

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name, slug, description, price, compare_price, sku, brand, tags,
      category_id, is_featured, is_new_arrival, is_best_seller, images, variants
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const id = uuidv4();
    const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await query(
      `INSERT INTO products (id, name, slug, description, price, compare_price, sku, brand, tags, category_id, is_featured, is_new_arrival, is_best_seller)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, productSlug, description || null, price, compare_price || null, sku || null, brand || 'Surema', JSON.stringify(tags || []), category_id || null, is_featured || false, is_new_arrival || false, is_best_seller || false]
    );

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          'INSERT INTO product_images (id, product_id, url, alt_text, display_order, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), id, images[i].url, images[i].alt_text || null, i, i === 0]
        );
      }
    }

    if (variants && variants.length > 0) {
      for (const v of variants) {
        await query(
          'INSERT INTO product_variants (id, product_id, size, color, color_hex, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), id, v.size, v.color || null, v.color_hex || null, v.stock || 0]
        );
      }
    }

    const product = await getOne('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json({ product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { images, ...productUpdates } = updates;

    const fields = [];
    const values = [];
    const allowedFields = ['name', 'slug', 'description', 'price', 'compare_price', 'sku', 'brand', 'tags', 'category_id', 'is_featured', 'is_new_arrival', 'is_best_seller', 'is_active'];

    for (const [key, val] of Object.entries(productUpdates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(key === 'tags' ? JSON.stringify(val) : val);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    if (Array.isArray(images)) {
      await query('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        const image = images[i] || {};
        await query(
          'INSERT INTO product_images (id, product_id, url, alt_text, display_order, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
          [image.id || uuidv4(), id, image.url, image.alt_text || null, i, image.is_primary || i === 0]
        );
      }
    }

    if (fields.length === 0 && !Array.isArray(images)) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const product = await getOne('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
