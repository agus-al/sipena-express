// models/usersModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================
// 1. DEFINISI MODEL
// ============================
const Users = sequelize.define('Users', {
  id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
  nip: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING }
}, {
  tableName: 'users',
  timestamps: false
});

// ============================
// 2. EXPORT FUNGSI
// ============================
module.exports = {
  // Cari user berdasarkan NIP
  findByNip: async (nip) => {
    return await Users.findOne({ where: { nip } });
  },

  // Buat user baru
  create: async (data) => {
    // Auto-increment ID manual (kayak JSON sebelumnya)
    const last = await Users.findOne({
      order: [['id', 'DESC']]
    });

    const newId = last ? Number(last.id) + 1 : 1;

    const baru = {
      id: newId,
      nip: data.nip ?? '',
      password: data.password ?? '',
      role: data.role ?? ''
    };

    return await Users.create(baru);
  },

  // (Opsional) Ambil semua user
  getAll: async () => {
    return await Users.findAll();
  },

  // (Opsional) Hapus user
  remove: async (id) => {
    const item = await Users.findOne({ where: { id } });
    if (!item) return false;
    await Users.destroy({ where: { id } });
    return true;
  }
};
