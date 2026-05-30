import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all savings goals
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM savings ORDER BY deadline');
    
    const camelCaseRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      targetAmount: Number(row.target_amount),
      currentAmount: Number(row.current_amount),
      emoji: row.emoji,
      deadline: row.deadline
    }));

    res.json(camelCaseRows);
  } catch (error) {
    next(error);
  }
});

// POST create savings goal
router.post('/', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO savings (id, name, target_amount, current_amount, emoji, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, targetAmount, currentAmount || 0, emoji, deadline]
    );
    
    res.status(201).json({
      id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      emoji,
      deadline
    });
  } catch (error) {
    next(error);
  }
});

// PUT update savings goal
router.put('/:id', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    
    const [result] = await pool.query(
      'UPDATE savings SET name = ?, target_amount = ?, current_amount = ?, emoji = ?, deadline = ? WHERE id = ?',
      [name, targetAmount, currentAmount, emoji, deadline, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json({
      id: req.params.id,
      name,
      targetAmount,
      currentAmount,
      emoji,
      deadline
    });
  } catch (error) {
    next(error);
  }
});

// DELETE savings goal
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM savings WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;