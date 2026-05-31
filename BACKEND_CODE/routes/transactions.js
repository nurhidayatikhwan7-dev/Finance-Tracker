import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all transactions
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// GET single transaction
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create transaction
// POST create transaction
router.post('/', async (req, res, next) => {
  try {
    const { name, amount, category, type, date, emoji } = req.body;
    const id = uuidv4();
    
    // UBAH 'category' MENJADI 'category_id' SESUAI KOLOM MYSQL JIKA RELEVAN
    await pool.query(
      'INSERT INTO transactions (id, name, amount, category_id, type, date, emoji) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, amount, category, type, date, emoji]
    );
    
    res.status(201).json({
      id,
      name,
      amount,
      category,
      type,
      date,
      emoji
    });
  } catch (error) {
    next(error);
  }
});

// PUT update transaction
// PUT update transaction
router.put('/:id', async (req, res, next) => {
  try {
    const { name, amount, category, type, date, emoji } = req.body;
    
    // UBAH 'category = ?' MENJADI 'category_id = ?'
    const [result] = await pool.query(
      'UPDATE transactions SET name = ?, amount = ?, category_id = ?, type = ?, date = ?, emoji = ? WHERE id = ?',
      [name, amount, category, type, date, emoji, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      id: req.params.id,
      name,
      amount,
      category,
      type,
      date,
      emoji
    });
  } catch (error) {
    next(error);
  }
});

// DELETE transaction
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;