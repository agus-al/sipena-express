const express = require('express');
const router = express.Router();
const controller = require('../controllers/kinerjaController');

// ============================================================
// ROUTE UNTUK AI (diletakkan di atas route dinamis seperti /:id)
// ============================================================

// POST nilai satu data berdasarkan ID
router.post('/nilai/:id', controller.nilaiSatuData);

// POST nilai semua data yang belum dinilai
router.post('/nilai-semua', controller.nilaiSemuaData);

// ============================================================
// ROUTE YANG SUDAH ADA
// ============================================================

// GET rekap tahunan per org/jabatan untuk admin
router.get('/rekap/tahunan', controller.summaryByOrgJabatan);

// GET semua kinerja (filter by role)
router.get('/', controller.getAll);

// GET kinerja by SKP ID
router.get('/skp/:skp_id', controller.getBySkpId);

// GET kinerja by ID
router.get('/:id', controller.getById);

// POST tambah kinerja baru
router.post('/', controller.create);

// PUT update kinerja
router.put('/:id', controller.update);

// DELETE hapus kinerja
router.delete('/:id', controller.delete);

// DELETE hapus berdasarkan SKP ID
router.delete('/skp/:skp_id', controller.deleteBySkpId);

// DELETE hapus berdasarkan nip + tahun
router.delete('/user/tahun', controller.deleteByUserAndTahun);

module.exports = router;
