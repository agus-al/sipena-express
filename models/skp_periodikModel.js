// models/skp_periodikModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================
// 1. DEFINISI MODEL
// ============================
const SKPPeriodik = sequelize.define('SKPPeriodik', {
  id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
  nip: { type: DataTypes.TEXT },
  kategori: { type: DataTypes.TEXT },
  rencana_hasil_kerja_pimpinan: { type: DataTypes.TEXT },
  rencana_hasil_kerja: { type: DataTypes.TEXT },
  jenis: { type: DataTypes.TEXT },
  rencana_aksi: { type: DataTypes.TEXT },
  aspek: { type: DataTypes.TEXT },
  indikator_kinerja_individu: { type: DataTypes.TEXT },
  target_bulanan: { type: DataTypes.TEXT },
  periode_bulan: { type: DataTypes.INTEGER },  // ✅ UBAH: bulan → periode_bulan
  periode_tahun: { type: DataTypes.INTEGER }   // ✅ UBAH: tahun → periode_tahun
}, {
  tableName: 'skp_periodik',
  timestamps: false
});

// ============================
// 2. EXPORT FUNGSI
// ============================
module.exports = {
  getAll: async () => {
    return await SKPPeriodik.findAll();
  },

  getById: async (id) => {
    return await SKPPeriodik.findOne({ where: { id } });
  },

  getByNip: async (nip) => {
    return await SKPPeriodik.findAll({ where: { nip } });
  },

  // ✅ UBAH: cari berdasarkan periode_bulan & periode_tahun
  getByPeriode: async (bulan, tahun) => {
    return await SKPPeriodik.findAll({
      where: {
        periode_bulan: bulan,
        periode_tahun: tahun
      }
    });
  },

  create: async (data) => {
    const baru = {
      id: data.id ?? Date.now(),
      nip: data.nip ?? '',
      kategori: data.kategori ?? '',
      rencana_hasil_kerja_pimpinan: data.rencana_hasil_kerja_pimpinan ?? '',
      rencana_hasil_kerja: data.rencana_hasil_kerja ?? '',
      jenis: data.jenis ?? '',
      rencana_aksi: typeof data.rencana_aksi === 'object'
        ? JSON.stringify(data.rencana_aksi)
        : (data.rencana_aksi ?? ''),
      aspek: data.aspek ?? '',
      indikator_kinerja_individu: data.indikator_kinerja_individu ?? '',
      target_bulanan: typeof data.target_bulanan === 'object'
        ? JSON.stringify(data.target_bulanan)
        : (data.target_bulanan ?? ''),
      periode_bulan: data.periode_bulan ?? data.bulan ?? null,  // ✅ support keduanya
      periode_tahun: data.periode_tahun ?? data.tahun ?? null
    };
    return await SKPPeriodik.create(baru);
  },

  update: async (id, data) => {
    const item = await SKPPeriodik.findOne({ where: { id } });
    if (!item) return null;

    const updateData = { ...data };

    // Normalisasi nama kolom
    if (updateData.bulan !== undefined) {
      updateData.periode_bulan = updateData.bulan;
      delete updateData.bulan;
    }
    if (updateData.tahun !== undefined) {
      updateData.periode_tahun = updateData.tahun;
      delete updateData.tahun;
    }

    if (typeof updateData.rencana_aksi === 'object') {
      updateData.rencana_aksi = JSON.stringify(updateData.rencana_aksi);
    }
    if (typeof updateData.target_bulanan === 'object') {
      updateData.target_bulanan = JSON.stringify(updateData.target_bulanan);
    }

    await item.update(updateData);
    return item;
  },

  delete: async (id) => {
    await SKPPeriodik.destroy({ where: { id } });
    return await SKPPeriodik.findAll();
  },

  deleteByNip: async (nip) => {
    await SKPPeriodik.destroy({ where: { nip } });
    return await SKPPeriodik.findAll();
  }
};
