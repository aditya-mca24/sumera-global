import express, { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend environment.',
      });
    }

    const {
      items,
      paymentMethod,
      shipping_address,
      coupon_code,
      notes,
      subtotal,
      discount,
      shipping,
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    if (!total || Number(total) <= 0) {
      return res.status(400).json({ error: 'Total must be greater than zero.' });
    }

    const orderId = uuidv4();

    // For COD, just create the order without Razorpay
    if (paymentMethod === 'cod') {
      await query(
        `INSERT INTO orders (id, user_id, status, payment_method, payment_status, subtotal, discount, shipping, total, coupon_code, shipping_address, notes)
         VALUES (?, ?, 'pending', ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          req.user.id,
          paymentMethod,
          subtotal,
          discount || 0,
          shipping || 0,
          total,
          coupon_code || null,
          JSON.stringify(shipping_address),
          notes || null,
        ],
      );

      for (const item of items) {
        await query(
          `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, variant_size, variant_color, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            orderId,
            item.product_id || null,
            item.product_name,
            item.product_image || null,
            item.variant_size || null,
            item.variant_color || null,
            item.quantity,
            item.unit_price,
            item.total_price,
          ],
        );
      }

      return res.json({
        orderId,
        paymentMethod: 'cod',
        message: 'COD order created successfully',
      });
    }

    // For online payments, create Razorpay order
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(Number(total) * 100), // Amount in paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          userId: req.user.id,
          paymentMethod,
          couponCode: coupon_code || '',
        },
      });

      // Save pending order to database
      await query(
        `INSERT INTO orders (id, user_id, status, payment_method, payment_status, subtotal, discount, shipping, total, coupon_code, shipping_address, notes, razorpay_order_id)
         VALUES (?, ?, 'pending', ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          req.user.id,
          paymentMethod || 'card',
          subtotal,
          discount || 0,
          shipping || 0,
          total,
          coupon_code || null,
          JSON.stringify(shipping_address),
          notes || null,
          razorpayOrder.id,
        ],
      );

      for (const item of items) {
        await query(
          `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, variant_size, variant_color, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            orderId,
            item.product_id || null,
            item.product_name,
            item.product_image || null,
            item.variant_size || null,
            item.variant_color || null,
            item.quantity,
            item.unit_price,
            item.total_price,
          ],
        );
      }

      res.json({
        orderId,
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId,
        amount: Math.round(Number(total) * 100),
        currency: 'INR',
        userEmail: req.user.email,
        userName: req.user.full_name || 'Customer',
      });
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      res.status(500).json({
        error: error?.message || 'Failed to create payment order',
      });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process checkout',
    });
  }
});

router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details.' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed.' });
    }

    // Update order status
    await query(
      'UPDATE orders SET payment_status = ?, status = ?, razorpay_payment_id = ? WHERE id = ?',
      ['paid', 'confirmed', razorpay_payment_id, orderId],
    );

    // Clear user's cart
    await query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    res.json({ message: 'Payment verified and confirmed', orderId });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: error?.message || 'Payment verification failed',
    });
  }
});

export default router;
