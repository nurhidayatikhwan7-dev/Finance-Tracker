import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

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

router.post('/', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    const id = 'sv-' + Date.now().toString().slice(-6); 
    
    let safeDeadline = null;
    if (deadline) {
      safeDeadline = deadline.includes('T') ? deadline.split('T')[0] : deadline.slice(0, 10);
    }

    await pool.query(
      'INSERT INTO savings (id, name, target_amount, current_amount, emoji, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, Number(targetAmount), Number(currentAmount) || 0, emoji, safeDeadline]
    );
    
    res.status(201).json({
      id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      emoji,
      deadline: safeDeadline
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    
    let safeDeadline = null;
    if (deadline) {
      safeDeadline = deadline.includes('T') ? deadline.split('T')[0] : deadline.slice(0, 10);
    }

    // 🛡️ AMANKAN ANGKA: Jika hasil konversi adalah NaN, otomatis gunakan 0 atau angka dari frontend secara aman
    const safeTargetAmount = isNaN(Number(targetAmount)) ? 0 : Number(targetAmount);
    const safeCurrentAmount = isNaN(Number(currentAmount)) ? 0 : Number(currentAmount);

    const [result] = await pool.query(
      'UPDATE savings SET name = ?, target_amount = ?, current_amount = ?, emoji = ?, deadline = ? WHERE id = ?',
      [name, safeTargetAmount, safeCurrentAmount, emoji, safeDeadline, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json({
      id: req.params.id,
      name,
      targetAmount: safeTargetAmount,
      currentAmount: safeCurrentAmount,
      emoji,
      deadline: safeDeadline
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM savings WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;