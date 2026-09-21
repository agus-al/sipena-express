// controllers/tupoksiController.js
const model = require('../models/tupoksiModel');
const pegawaiModel = require('../models/pegawaiModel'); // ⚠️ Butuh ini!

// ============================
// GET semua tupoksi
// ============================
const getAllTupoksi = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Belum login' });
    }

    const { role, nip } = req.session.user;
    const data = await model.getAll();

    // Admin & developer lihat semua
    if (role === 'admin' || role === 'developer') {
      return res.json(data);
    }

    // User biasa: filter berdasarkan jabatan
    const dataPegawai = await pegawaiModel.getByNip(nip);

    if (!dataPegawai) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const tupoksiSaya = data.filter(t =>
      t.jabatan && t.jabatan.toLowerCase() === dataPegawai.jabatan.toLowerCase()
    );

    res.json(tupoksiSaya);
  } catch (err) {
    console.error('Error getAllTupoksi:', err);
    res.status(500).json({ message: err.message });
  }
};

// ============================
// POST tambah tupoksi
// ============================
const createTupoksi = async (req, res) => {
  try {
    const { jabatan, tugas } = req.body;

    if (!jabatan) {
      return res.status(400).json({ error: 'Nama jabatan wajib diisi' });
    }
    if (!tugas || !Array.isArray(tugas) || tugas.length === 0) {
      return res.status(400).json({ error: 'Minimal isi satu rincian tugas' });
    }

    const baru = await model.create({ jabatan, tugas });
    res.status(201).json(baru);
  } catch (err) {
    console.error('Error createTupoksi:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================
// PUT update tupoksi
// ============================
const updateTupoksi = async (req, res) => {
  try {
    const id = req.params.id;
    const { jabatan, tugas } = req.body;

    const updated = await model.update(id, { jabatan, tugas });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Tupoksi tidak ditemukan' });
    }
  } catch (err) {
    console.error('Error updateTupoksi:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================
// DELETE tupoksi
// ============================
const deleteTupoksi = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await model.remove(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Tupoksi tidak ditemukan' });
    }
  } catch (err) {
    console.error('Error deleteTupoksi:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllTupoksi, createTupoksi, updateTupoksi, deleteTupoksi };
