import db from './database.js';

async function initDatabase() {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        full_name VARCHAR(255),
        phone VARCHAR(50),
        avatar_url TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);

    const [userCols] = await connection.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    );
    const userColNames = userCols.map((c) => c.COLUMN_NAME);
    if (!userColNames.includes('full_name')) {
      await connection.execute('ALTER TABLE users ADD COLUMN full_name VARCHAR(255)');
    }
    if (!userColNames.includes('phone')) {
      await connection.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(50)');
    }
    if (!userColNames.includes('avatar_url')) {
      await connection.execute('ALTER TABLE users ADD COLUMN avatar_url TEXT');
    }
    if (!userColNames.includes('is_admin')) {
      await connection.execute('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
    }
    if (!userColNames.includes('role')) {
      await connection.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'");
    }
    if (!userColNames.includes('updated_at')) {
      await connection.execute('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        token_hash VARCHAR(64) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_token (user_id, token_hash)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS addresses (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        line1 VARCHAR(255) NOT NULL,
        line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_active (is_active)
      )
    `);

    const [catCols] = await connection.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'categories'`
    );
    const catColNames = catCols.map((c) => c.COLUMN_NAME);
    if (!catColNames.includes('display_order')) {
      await connection.execute('ALTER TABLE categories ADD COLUMN display_order INT DEFAULT 0');
    }
    if (!catColNames.includes('is_active')) {
      await connection.execute('ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        category_id CHAR(36),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        compare_price DECIMAL(10,2),
        sku VARCHAR(100) UNIQUE,
        brand VARCHAR(100) DEFAULT 'Surema',
        tags JSON,
        is_featured BOOLEAN DEFAULT FALSE,
        is_new_arrival BOOLEAN DEFAULT FALSE,
        is_best_seller BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_category (category_id),
        INDEX idx_slug (slug),
        INDEX idx_active (is_active)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        url TEXT NOT NULL,
        alt_text VARCHAR(255),
        display_order INT DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product (product_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        size VARCHAR(50) NOT NULL,
        color VARCHAR(100),
        color_hex VARCHAR(20),
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product (product_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
        subtotal DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        shipping DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        coupon_code VARCHAR(50),
        shipping_address JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_status (status)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id CHAR(36) PRIMARY KEY,
        order_id CHAR(36) NOT NULL,
        product_id CHAR(36),
        product_name VARCHAR(255) NOT NULL,
        product_image TEXT,
        variant_size VARCHAR(50),
        variant_color VARCHAR(100),
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_order (order_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        variant_id CHAR(36),
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
        UNIQUE KEY unique_user_product_variant (user_id, product_id, variant_id),
        INDEX idx_user (user_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id),
        INDEX idx_user (user_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        title VARCHAR(255),
        body TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_product (product_id),
        INDEX idx_approved (is_approved)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id CHAR(36) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        type ENUM('percentage','fixed') NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        min_order_value DECIMAL(10,2) DEFAULT 0,
        max_uses INT,
        used_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_active (is_active)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id CHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        image_url TEXT NOT NULL,
        link_url VARCHAR(255),
        button_text VARCHAR(100),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_active (is_active)
      )
    `);

    const [bannerCols] = await connection.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners'`
    );
    const bannerColNames = bannerCols.map((c) => c.COLUMN_NAME);
    if (!bannerColNames.includes('display_order')) {
      await connection.execute('ALTER TABLE banners ADD COLUMN display_order INT DEFAULT 0');
    }
    if (!bannerColNames.includes('is_active')) {
      await connection.execute('ALTER TABLE banners ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bulk_orders (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        company_name VARCHAR(255),
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        product_type VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        sizes JSON,
        colors JSON,
        customization TEXT,
        delivery_location VARCHAR(255) NOT NULL,
        notes TEXT,
        status ENUM('pending','reviewing','quoted','confirmed','in_production','dispatched','completed','cancelled') DEFAULT 'pending',
        quotation_amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);

    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count === 0) {
      const { v4: uuidv4 } = await import('uuid');
      const cats = [
        [uuidv4(), 'Western Tops', 'western-tops', 'Trendy western-style tops for every occasion', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400', 1],
        [uuidv4(), 'Crop Tops', 'crop-tops', 'Stylish crop tops for a modern look', 'https://images.pexels.com/photos/2220336/pexels-photo-2220336.jpeg?auto=compress&cs=tinysrgb&w=400', 2],
        [uuidv4(), 'Co-ord Sets', 'co-ord-sets', 'Matching co-ordinated sets for effortless style', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400', 3],
        [uuidv4(), 'T-Shirts', 't-shirts', 'Comfortable and casual t-shirts', 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=400', 4],
        [uuidv4(), 'Jeans', 'jeans', 'Premium quality jeans for all fits', 'https://images.pexels.com/photos/1082526/pexels-photo-1082526.jpeg?auto=compress&cs=tinysrgb&w=400', 5],
        [uuidv4(), 'Kurtis', 'kurtis', 'Elegant kurtis blending tradition and comfort', 'https://images.pexels.com/photos/2896840/pexels-photo-2896840.jpeg?auto=compress&cs=tinysrgb&w=400', 6],
        [uuidv4(), 'Dresses', 'dresses', 'Beautiful dresses for every occasion', 'https://images.pexels.com/photos/1030946/pexels-photo-1030946.jpeg?auto=compress&cs=tinysrgb&w=400', 7],
      ];
      for (const [id, name, slug, desc, img, order] of cats) {
        await connection.execute(
          'INSERT IGNORE INTO categories (id, name, slug, description, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?)',
          [id, name, slug, desc, img, order]
        );
      }
    }

    const [banners] = await connection.execute('SELECT COUNT(*) as count FROM banners');
    if (banners[0].count === 0) {
      const { v4: uuidv4 } = await import('uuid');
      const bns = [
        [uuidv4(), 'New Season, New You', 'Discover the latest fashion trends', 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1260', '/shop', 'Shop Now', 1],
        [uuidv4(), 'Summer Collection 2025', 'Breezy styles for sunny days', 'https://images.pexels.com/photos/1375736/pexels-photo-1375736.jpeg?auto=compress&cs=tinysrgb&w=1260', '/shop?category=dresses', 'Explore', 2],
        [uuidv4(), 'Bulk Orders Welcome', 'Manufacturing-grade quality at scale', 'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=1260', '/bulk-order', 'Get Quote', 3],
      ];
      for (const [id, title, sub, img, link, btn, order] of bns) {
        await connection.execute(
          'INSERT IGNORE INTO banners (id, title, subtitle, image_url, link_url, button_text, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, title, sub, img, link, btn, order]
        );
      }
    }

    await connection.commit();
    console.log('Database initialized successfully');
  } catch (err) {
    await connection.rollback();
    console.error('Database initialization error:', err);
    throw err;
  } finally {
    connection.release();
  }
}

export default initDatabase;
