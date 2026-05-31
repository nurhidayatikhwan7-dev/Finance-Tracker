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
    console.error("❌ Eror GET Savings:", error);
    next(error);
  }
});

// POST create savings goal
router.post('/', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    
    // TRICK: Jika UUID kepanjangan membuat database crash, kita buat cadangan ID berbasis timestamp unik
    const id = 'sv-' + Date.now().toString().slice(-6); 
    
    // Pastikan format tanggal aman (jika deadline kosong, set null atau tanggal hari ini)
    const safeDeadline = deadline ? deadline.slice(0, 10) : null;

    console.log("Mengirim data ke MySQL:", { id, name, targetAmount, currentAmount, emoji, safeDeadline });

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
    console.error("❌ BIANG KEROK EROR 500 POST SAVINGS:", error); // Kode ini akan memuntahkan eror asli di Render!
    next(error);
  }
});

// PUT update savings goal
router.put('/:id', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    const safeDeadline = deadline ? deadline.slice(0, 10) : null;

    const [result] = await pool.query(
      'UPDATE savings SET name = ?, target_amount = ?, current_amount = ?, emoji = ?, deadline = ? WHERE id = ?',
      [name, Number(targetAmount), Number(currentAmount), emoji, safeDeadline, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json({
      id: req.params.id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      emoji,
      deadline: safeDeadline
    });
  } catch (error) {
    console.error("❌ Eror PUT Savings:", error);
    next(error);
  }
});

// DELETE savings goal
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM savings WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error("❌ Eror DELETE Savings:", error);
    next(error);
  }
});

export default router;