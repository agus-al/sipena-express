// models/tupoksiModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================
// 1. DEFINISI MODEL
// ============================
const Tupoksi = sequelize.define('Tupoksi', {
  id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
  jabatan: { type: DataTypes.STRING },
  tugas: { type: DataTypes.TEXT }
}, {
  tableName: 'tupoksi',
  timestamps: false
});

// ============================
// 2. EXPORT FUNGSI
// ============================
module.exports = {
  // Ambil semua data
  getAll: async () => {
    return await Tupoksi.findAll({
      order: [['id', 'ASC']]
    });
  },

  // Ambil berdasarkan ID
  getById: async (id) => {
    return await Tupoksi.findOne({ where: { id } });
  },

  // Buat data baru
  create: async (newItem) => {
    // Auto-increment ID manual (kayak JSON sebelumnya)
    const last = await Tupoksi.findOne({
      order: [['id', 'DESC']]
    });

    const newId = last ? Number(last.id) + 1 : 1;

    const baru = {
      id: newId,
      jabatan: newItem.jabatan ?? '',
      tugas: newItem.tugas ?? ''
    };

    return await Tupoksi.create(baru);
  },

  // Update berdasarkan ID
  update: async (id, updatedData) => {
    const item = await Tupoksi.findOne({ where: { id } });
    if (!item) return null;

    await item.update({
      jabatan: updatedData.jabatan !== undefined ? updatedData.jabatan : item.jabatan,
      tugas: updatedData.tugas !== undefined ? updatedData.tugas : item.tugas,
      id: item.id // ID tidak boleh berubah
    });

    return item;
  },

  // Hapus berdasarkan ID
  remove: async (id) => {
    const item = await Tupoksi.findOne({ where: { id } });
    if (!item) return false;

    await Tupoksi.destroy({ where: { id } });
    return true;
  }
};
