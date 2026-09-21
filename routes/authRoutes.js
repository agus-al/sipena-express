const express = require('express');
const router = express.Router();
const path = require('path');
const ctrl = require('../controllers/authController');

// GET - halaman login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// GET - halaman register
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

// POST - proses login
router.post('/login', ctrl.login);

// POST - proses register
router.post('/register', ctrl.register);

// GET - logout
router.get('/logout', ctrl.logout);

// GET - data user yang sedang login
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Belum login' });
  }
  
  // Ambil nama dari pegawai.json berdasarkan NIP
  const pegawai = require('../data/pegawai.json');
  const dataPegawai = pegawai.find(p => String(p.nip) === String(req.session.user.nip));
  
  res.json({
    nip: req.session.user.nip,
    role: req.session.user.role,
    nama: dataPegawai ? dataPegawai.nama : req.session.user.nip,
    id: dataPegawai ? dataPegawai.id : null
  });
});

module.exports = router;