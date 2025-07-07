// authSocial.js
const express = require('express');
const router = express.Router();
const db = require('./database');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'segredo_pedzap';

// Google OAuth
router.post('/google', async (req, res) => {
  const { googleId, nome, email } = req.body;
  if (!googleId || !email) return res.status(400).json({ error: 'Dados do Google incompletos.' });
  db.get('SELECT * FROM usuarios WHERE google_id = ? OR email = ?', [googleId, email], (err, user) => {
    if (user) {
      // Login
      const token = jwt.sign({ id: user.id, tipo: user.tipo }, SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo } });
    }
    // Cadastro
    db.run('INSERT INTO usuarios (nome, email, google_id, tipo) VALUES (?, ?, ?, ?)', [nome, email, googleId, 'free'], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const token = jwt.sign({ id: this.lastID, tipo: 'free' }, SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: this.lastID, nome, email, tipo: 'free' } });
    });
  });
});

// Facebook OAuth
router.post('/facebook', async (req, res) => {
  const { facebookId, nome, email } = req.body;
  if (!facebookId || !email) return res.status(400).json({ error: 'Dados do Facebook incompletos.' });
  db.get('SELECT * FROM usuarios WHERE facebook_id = ? OR email = ?', [facebookId, email], (err, user) => {
    if (user) {
      // Login
      const token = jwt.sign({ id: user.id, tipo: user.tipo }, SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo } });
    }
    // Cadastro
    db.run('INSERT INTO usuarios (nome, email, facebook_id, tipo) VALUES (?, ?, ?, ?)', [nome, email, facebookId, 'free'], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const token = jwt.sign({ id: this.lastID, tipo: 'free' }, SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: this.lastID, nome, email, tipo: 'free' } });
    });
  });
});

module.exports = router;
