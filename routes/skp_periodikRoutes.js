/**
 * ============================================================
 * ROUTES SKP PERIODIK
 * ============================================================
 */

 const express = require('express');
 const router = express.Router();
 
 const skp_periodikController =
   require('../controllers/skp_periodikController');
 
 // ============================================================
 // ROOT
 // ============================================================
 
 router.get('/', skp_periodikController.getAllData);
 
 // ============================================================
 // PERIODE
 // ============================================================
 
 router.get(
   '/periode/:bulan/:tahun',
   skp_periodikController.getPeriode
 );
 
 router.post(
   '/periode',
   skp_periodikController.tambahPeriode
 );
 
 router.delete(
   '/periode/:bulan/:tahun',
   skp_periodikController.hapusPeriode
 );
 
 // ============================================================
 // HASIL KERJA
 // ============================================================
 
 router.post(
   '/hasil-kerja/:bulan/:tahun',
   skp_periodikController.tambahHasilKerja
 );
 
 router.put(
   '/hasil-kerja/:bulan/:tahun/:id',
   skp_periodikController.editHasilKerja
 );
 
 router.delete(
   '/hasil-kerja/:bulan/:tahun/:id',
   skp_periodikController.hapusHasilKerja
 );
 
 // ============================================================
 // SKP TAHUNAN (UNTUK DROPDOWN)  <-- TAMBAHAN
 // ============================================================
 
 router.get(
   '/skp-tahunan',
   skp_periodikController.getSkpTahunanList
 );
 
 router.get(
   '/skp-tahunan/:id',
   skp_periodikController.getSkpTahunanById
 );
 
 // ============================================================
 // EXPORT
 // ============================================================
 
 module.exports = router;
 