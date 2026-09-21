// routes/pegawaiRoutes.js
const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');

// GET semua pegawai (filter by role)
router.get('/', pegawaiController.getAll);

// GET /me (data sendiri) — HARUS di atas /:id
router.get('/me', pegawaiController.getMe);

// POST tambah pegawai
router.post('/', pegawaiController.create);

// PUT update pegawai
router.put('/:id', pegawaiController.update);

// DELETE hapus pegawai
router.delete('/:id', pegawaiController.delete);

// GET detail by ID — PALING BAWAH
router.get('/:id', pegawaiController.getById);

module.exports = router;
