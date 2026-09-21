// controllers/pegawaiController.js
const pegawaiModel = require('../models/pegawaiModel');

// ============================
// Helper cek login
// ============================
const isLoggedIn = (req, res) => {
  if (!req.session || !req.session.user) {
    res.status(401).json({ message: 'Belum login' });
    return false;
  }
  return true;
};

// ============================
// GET ALL (filter by role)
// ============================
exports.getAll = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    const { role, nip } = req.session.user;

    if (role === 'admin' || role === 'developer') {
      return res.json(await pegawaiModel.getAll());
    }

    if (role === 'user') {
      const dataSaya = await pegawaiModel.getByNip(nip);
      return res.json(dataSaya ? [dataSaya] : []);
    }

    res.status(403).json({ message: 'Akses ditolak' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================
// GET BY ID
// ============================
exports.getById = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    const pegawai = await pegawaiModel.getById(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json(pegawai);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================
// GET ME (data sendiri)
// ============================
exports.getMe = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    const nipLogin = req.session.user.nip;
    const dataSaya = await pegawaiModel.getByNip(nipLogin);
    if (!dataSaya) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json(dataSaya);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================
// CREATE
// ============================
exports.create = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    const pegawaiBaru = await pegawaiModel.create(req.body);
    res.status(201).json({ message: 'Berhasil ditambahkan', data: pegawaiBaru });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================
// UPDATE
// ============================
exports.update = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    const updated = await pegawaiModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json({ message: 'Berhasil diupdate', data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================
// DELETE
// ============================
exports.delete = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    await pegawaiModel.delete(req.params.id);
    res.json({ message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
