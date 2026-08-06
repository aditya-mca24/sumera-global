import { Router } from 'express';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = await query('SELECT id FROM newsletter_subscribers WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    await query(
      'INSERT INTO newsletter_subscribers (id, email, is_active) VALUES (?, ?, TRUE)',
      [uuidv4(), normalizedEmail]
    );
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
