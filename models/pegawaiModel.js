// models/pegawaiModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================
// DEFINISI MODEL
// ============================
const Pegawai = sequelize.define('Pegawai', {
  id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
  nama: { type: DataTypes.TEXT },
  nip: { type: DataTypes.TEXT },
  jabatan: { type: DataTypes.TEXT },
  unit_kerja: { type: DataTypes.TEXT },
  status: { type: DataTypes.TEXT },
  sk: { type: DataTypes.TEXT },
  riwayat_jabatan: { type: DataTypes.TEXT },
  tempat_lahir: { type: DataTypes.TEXT },
  tanggal_lahir: { type: DataTypes.TEXT },
  jenis_kelamin: { type: DataTypes.TEXT },
  agama: { type: DataTypes.TEXT }
}, {
  tableName: 'pegawai',
  timestamps: false
});

// ============================
// EXPORT FUNGSI
// ============================
module.exports = {
  getAll: async () => {
    return await Pegawai.findAll({ order: [['id', 'ASC']] });
  },
  getById: async (id) => {
    return await Pegawai.findOne({ where: { id } });
  },
  getByNip: async (nip) => {
    return await Pegawai.findOne({ where: { nip } });
  },
  getByJabatan: async (jabatan) => {
    return await Pegawai.findAll({ where: { jabatan } });
  },
  create: async (data) => {
    const baru = {
      id: data.id ?? Date.now(),
      nama: data.nama ?? '',
      nip: data.nip ?? '',
      jabatan: data.jabatan ?? '',
      unit_kerja: data.unit_kerja ?? '',
      status: data.status ?? '',
      sk: data.sk ?? '',
      riwayat_jabatan: data.riwayat_jabatan ?? '',
      tempat_lahir: data.tempat_lahir ?? '',
      tanggal_lahir: data.tanggal_lahir ?? '',
      jenis_kelamin: data.jenis_kelamin ?? '',
      agama: data.agama ?? ''
    };
    return await Pegawai.create(baru);
  },
  update: async (id, data) => {
    const item = await Pegawai.findOne({ where: { id } });
    if (!item) return null;
    await item.update(data);
    return item;
  },
  delete: async (id) => {
    await Pegawai.destroy({ where: { id } });
    return await Pegawai.findAll();
  }
};
