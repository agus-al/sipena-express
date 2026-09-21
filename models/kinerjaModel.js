// models/kinerjaModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================
// 1. DEFINISI MODEL
// ============================
const Kinerja = sequelize.define('Kinerja', {
  id: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
  skp_id: { type: DataTypes.STRING },
  nip: { type: DataTypes.STRING },
  orgId: { type: DataTypes.STRING },
  jabatanId: { type: DataTypes.STRING },
  tahun: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  tipe: { type: DataTypes.STRING },
  rhk_pimpinan: { type: DataTypes.TEXT },
  aspek: { type: DataTypes.STRING },
  rencana_hasil_kerja: { type: DataTypes.TEXT },
  indikator: { type: DataTypes.TEXT },
  target: { type: DataTypes.STRING },
  satuan: { type: DataTypes.STRING },
  realisasi: { type: DataTypes.STRING },
  nilai: { type: DataTypes.STRING },
  catatan: { type: DataTypes.TEXT },
  score: { type: DataTypes.STRING },          // ✅ TAMBAHAN
  skp_tahunan_ai: { type: DataTypes.TEXT },   // ✅ TAMBAHAN
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE }
}, {
  tableName: 'kinerja',
  timestamps: false
});

// ============================
// 2. EXPORT FUNGSI
// ============================
module.exports = {
  // ===== GET =====
  getAll: async () => {
    return await Kinerja.findAll({
      order: [['rencana_hasil_kerja', 'ASC']]
    });
  },

  getById: async (id) => {
    return await Kinerja.findOne({ where: { id } });
  },

  getByNip: async (nip) => {
    return await Kinerja.findAll({ where: { nip } });
  },

  getBySkpId: async (skp_id) => {
    return await Kinerja.findAll({ where: { skp_id } });
  },

  getByTahun: async (tahun) => {
    return await Kinerja.findAll({ where: { tahun } });
  },

  getByUserAndTahun: async (nip, tahun) => {
    return await Kinerja.findAll({ where: { nip, tahun } });
  },

  getByOrgJabatan: async (tahun, orgId, jabatanId) => {
    return await Kinerja.findAll({ where: { tahun, orgId, jabatanId } });
  },

  getByOrg: async (orgId) => {
    return await Kinerja.findAll({ where: { orgId } });
  },

  getByJabatan: async (jabatanId) => {
    return await Kinerja.findAll({ where: { jabatanId } });
  },

  // ===== CREATE =====
  create: async (data) => {
    const now = Date.now();
    const baru = {
      id: now,
      skp_id: data.skp_id ?? now,
      nip: data.nip ?? '',
      orgId: data.orgId ?? '',
      jabatanId: data.jabatanId ?? '',
      tahun: data.tahun ?? '',
      role: data.role ?? '',
      status: data.status ?? 'draft',
      tipe: data.tipe ?? 'Utama',
      rhk_pimpinan: data.rhk_pimpinan ?? '',
      aspek: data.aspek ?? '',
      rencana_hasil_kerja: data.rencana_hasil_kerja ?? '',
      indikator: data.indikator ?? '',
      target: data.target ?? '',
      satuan: data.satuan ?? '',
      realisasi: data.realisasi ?? '',
      nilai: data.nilai ?? '',
      catatan: data.catatan ?? '',
      score: data.score ?? '',                        // ✅ TAMBAHAN
      skp_tahunan_ai: data.skp_tahunan_ai ?? '',      // ✅ TAMBAHAN
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };
    return await Kinerja.create(baru);
  },

  // ===== UPDATE =====
  update: async (id, data) => {
    const item = await Kinerja.findOne({ where: { id } });
    if (!item) return null;

    await item.update({
      ...data,
      updatedAt: new Date().toISOString()
    });

    return item;
  },

  // ===== DELETE =====
  delete: async (id) => {
    await Kinerja.destroy({ where: { id } });
    return await Kinerja.findAll();
  },

  deleteBySkpId: async (skp_id) => {
    await Kinerja.destroy({ where: { skp_id } });
    return await Kinerja.findAll();
  },

  deleteByUserAndTahun: async (nip, tahun) => {
    await Kinerja.destroy({ where: { nip, tahun } });
    return await Kinerja.findAll();
  },

  // ===== SUMMARY =====
  summaryByOrgJabatan: async (tahun) => {
    const data = await Kinerja.findAll({ where: { tahun } });
    const map = new Map();

    for (const item of data) {
      const key = `${item.orgId ?? ''}__${item.jabatanId ?? ''}`;
      if (!map.has(key)) {
        map.set(key, {
          orgId: item.orgId ?? '',
          jabatanId: item.jabatanId ?? '',
          tahun: item.tahun ?? '',
          total: 0,
          totalNilai: 0,
        });
      }
      const row = map.get(key);
      row.total += 1;

      const n = Number(item.nilai);
      if (!Number.isNaN(n)) row.totalNilai += n;
    }

    return Array.from(map.values());
  },
};
