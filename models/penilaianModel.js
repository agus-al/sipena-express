// models/penilaianModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================
// 1. DEFINISI MODEL
// ============================
const Penilaian = sequelize.define('Penilaian', {
  id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
  skp_periodik_id: { type: DataTypes.STRING, unique: true },
  bukti_dukung: { type: DataTypes.TEXT },
  realisasi: { type: DataTypes.STRING },
  penilaian: { type: DataTypes.STRING }
}, {
  tableName: 'penilaian',
  timestamps: false
});

// ============================
// 2. EXPORT FUNGSI (sama seperti JSON, tapi async)
// ============================
module.exports = {
  // Ambil semua data penilaian
  getAll: async () => {
    return await Penilaian.findAll();
  },

  // Ambil satu penilaian berdasarkan ID
  getById: async (id) => {
    return await Penilaian.findOne({ where: { id } });
  },

  // Ambil penilaian berdasarkan skp_periodik_id (unik)
  getBySkpId: async (skp_periodikId) => {
    return await Penilaian.findOne({ where: { skp_periodik_id: skp_periodikId } });
  },

  // Buat penilaian baru
  create: async (data) => {
    // Cegah duplikasi
    const existing = await Penilaian.findOne({
      where: { skp_periodik_id: data.skp_periodik_id }
    });
    if (existing) {
      throw new Error('Penilaian untuk SKP Periodik ini sudah ada.');
    }

    const baru = {
      id: Date.now(),
      skp_periodik_id: data.skp_periodik_id,
      bukti_dukung: data.bukti_dukung || '',
      realisasi: data.realisasi || '',
      penilaian: data.penilaian || ''
    };

    return await Penilaian.create(baru);
  },

  // Update penilaian (hanya field yang diizinkan)
  update: async (id, data) => {
    const item = await Penilaian.findOne({ where: { id } });
    if (!item) return null;

    await item.update({
      bukti_dukung: data.bukti_dukung !== undefined ? data.bukti_dukung : item.bukti_dukung,
      realisasi: data.realisasi !== undefined ? data.realisasi : item.realisasi,
      penilaian: data.penilaian !== undefined ? data.penilaian : item.penilaian
    });

    return item;
  },

  // Hapus penilaian
  delete: async (id) => {
    await Penilaian.destroy({ where: { id } });
    return await Penilaian.findAll();
  }
};
