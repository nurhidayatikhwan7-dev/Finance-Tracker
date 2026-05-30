import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all categories
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST create category
router.post('/', async (req, res, next) => {
  try {
    const { name, emoji, type } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO categories (id, name, emoji, type) VALUES (?, ?, ?, ?)',
      [id, name, emoji, type]
    );
    
    res.status(201).json({ id, name, emoji, type });
  } catch (error) {
    next(error);
  }
});

// DELETE category
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;