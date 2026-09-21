// controllers/penilaianController.js
const penilaianModel = require('../models/penilaianModel');
const skp_periodikModel = require('../models/skp_periodikModel');

// ============================================================
// KONFIGURASI NIP JABATAN STRUKTURAL KECAMATAN
// ============================================================
const NIP_CAMAT = '196811221993122001';
const NIP_SEKCAM = '197508011999032003';

// ============================================================
// GET LIST SKP PERIODIK (untuk dropdown)
// ============================================================
exports.getListSkpPeriodik = async (req, res) => {
  try {
    const { nip, bulan, tahun } = req.query;
    let allSkp = await skp_periodikModel.getAll();

    if (nip) allSkp = allSkp.filter(s => String(s.nip) === String(nip));
    if (bulan) allSkp = allSkp.filter(s => String(s.bulan) === String(bulan));
    if (tahun) allSkp = allSkp.filter(s => String(s.tahun) === String(tahun));

    res.json({ success: true, data: allSkp });
  } catch (error) {
    console.error('Error getListSkpPeriodik:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET SEMUA PENILAIAN (DENGAN FILTER HIERARKI)
// ============================================================
exports.getAll = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }

    const { role, nip } = req.session.user;
    const userNipStr = String(nip);

    let allPenilaian = await penilaianModel.getAll();
    const allSkp = (await skp_periodikModel.getAll()) || [];

    // 1. Admin / Developer → semua
    if (role === 'admin' || role === 'developer') {
      return res.json({ success: true, data: allPenilaian });
    }

    // 2. Camat → semua
    if (userNipStr === NIP_CAMAT) {
      return res.json({ success: true, data: allPenilaian });
    }

    // 3. Sekcam → semua kecuali SKP Camat
    if (userNipStr === NIP_SEKCAM) {
      const skpCamatIds = allSkp
        .filter(s => String(s.nip) === NIP_CAMAT)
        .map(s => String(s.id));
      const filtered = allPenilaian.filter(p => !skpCamatIds.includes(String(p.skp_periodik_id)));
      return res.json({ success: true, data: filtered });
    }

    // 4. Pegawai biasa → hanya SKP sendiri
    const mySkpIds = allSkp.filter(s => String(s.nip) === userNipStr).map(s => String(s.id));
    const myPenilaian = allPenilaian.filter(p => mySkpIds.includes(String(p.skp_periodik_id)));
    return res.json({ success: true, data: myPenilaian });
  } catch (error) {
    console.error('Error getAll:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET PENILAIAN BY SKP ID
// ============================================================
exports.getBySkpId = async (req, res) => {
  try {
    const { skp_id } = req.params;
    if (!skp_id) {
      return res.status(400).json({ success: false, message: 'skp_periodik_id wajib diisi' });
    }

    const data = await penilaianModel.getBySkpId(skp_id);

    if (!data) {
      return res.json({
        success: true,
        data: {
          id: null,
          skp_periodik_id: skp_id,
          realisasi: '',
          bukti_dukung: '',
          penilaian: ''
        }
      });
    }

    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Error getBySkpId:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET PENILAIAN BY ID
// ============================================================
exports.getById = async (req, res) => {
  try {
    const data = await penilaianModel.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }
    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Error getById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CREATE PENILAIAN (DENGAN VALIDASI WEWENANG)
// ============================================================
exports.create = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }

    const { role, nip } = req.session.user;
    const userNipStr = String(nip);
    const { skp_periodik_id, realisasi, bukti_dukung, penilaian } = req.body;

    if (!skp_periodik_id) {
      return res.status(400).json({ success: false, message: 'skp_periodik_id wajib diisi' });
    }

    const allSkp = (await skp_periodikModel.getAll()) || [];
    const skp = allSkp.find(s => String(s.id) === String(skp_periodik_id));

    if (!skp) {
      return res.status(404).json({ success: false, message: 'SKP Periodik tidak ditemukan' });
    }

    // Cek apakah sudah ada penilaian
    const existing = await penilaianModel.getBySkpId(skp_periodik_id);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Penilaian untuk SKP ini sudah ada. Gunakan PUT untuk update.'
      });
    }

    // Validasi wewenang
    const skpNip = String(skp.nip);
    const isAtasan = userNipStr === NIP_CAMAT || userNipStr === NIP_SEKCAM || role === 'admin' || role === 'developer';
    if (!isAtasan && userNipStr !== skpNip) {
      return res.status(403).json({ success: false, message: 'Anda tidak boleh menilai SKP orang lain' });
    }

    // Hanya atasan yang boleh mengisi field penilaian
    let finalPenilaian = '';
    if (isAtasan) {
      finalPenilaian = penilaian || '';
    }

    const baru = await penilaianModel.create({
      skp_periodik_id,
      realisasi: realisasi || '',
      bukti_dukung: bukti_dukung || '',
      penilaian: finalPenilaian
    });

    res.status(201).json({ success: true, data: baru });
  } catch (error) {
    console.error('Error create:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// UPDATE PENILAIAN (DENGAN VALIDASI WEWENANG)
// ============================================================
exports.update = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }

    const { id } = req.params;
    const { role, nip } = req.session.user;
    const userNipStr = String(nip);
    const { realisasi, bukti_dukung, penilaian } = req.body;

    const currentData = await penilaianModel.getById(id);
    if (!currentData) {
      return res.status(404).json({ success: false, message: 'Data penilaian tidak ditemukan' });
    }

    // Ambil SKP terkait
    const allSkp = (await skp_periodikModel.getAll()) || [];
    const skp = allSkp.find(s => String(s.id) === String(currentData.skp_periodik_id));
    if (!skp) {
      return res.status(404).json({ success: false, message: 'SKP terkait tidak ditemukan' });
    }

    const skpNip = String(skp.nip);
    const isAtasan = userNipStr === NIP_CAMAT || userNipStr === NIP_SEKCAM || role === 'admin' || role === 'developer';

    if (!isAtasan && userNipStr !== skpNip) {
      return res.status(403).json({ success: false, message: 'Anda tidak boleh mengubah data SKP orang lain' });
    }

    let updatedFields = {};

    if (isAtasan) {
      updatedFields = {
        realisasi: currentData.realisasi,
        bukti_dukung: currentData.bukti_dukung,
        penilaian: penilaian !== undefined ? penilaian : currentData.penilaian
      };
    } else {
      updatedFields = {
        realisasi: realisasi !== undefined ? realisasi : currentData.realisasi,
        bukti_dukung: bukti_dukung !== undefined ? bukti_dukung : currentData.bukti_dukung,
        penilaian: currentData.penilaian
      };
    }

    const updated = await penilaianModel.update(id, updatedFields);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error update:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// DELETE PENILAIAN
// ============================================================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await penilaianModel.delete(id);
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    console.error('Error delete:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
