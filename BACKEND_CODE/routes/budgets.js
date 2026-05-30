import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all budgets
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM budgets');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST create budget
router.post('/', async (req, res, next) => {
  try {
    const { categoryId, amount, period } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO budgets (id, category_id, amount, period) VALUES (?, ?, ?, ?)',
      [id, categoryId, amount, period || 'monthly']
    );
    
    res.status(201).json({ id, categoryId, amount, period: period || 'monthly' });
  } catch (error) {
    next(error);
  }
});

// PUT update budget
router.put('/:id', async (req, res, next) => {
  try {
    const { categoryId, amount, period } = req.body;
    
    const [result] = await pool.query(
      'UPDATE budgets SET category_id = ?, amount = ?, period = ? WHERE id = ?',
      [categoryId, amount, period, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json({ id: req.params.id, categoryId, amount, period });
  } catch (error) {
    next(error);
  }
});

// DELETE budget
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM budgets WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;