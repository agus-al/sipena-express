const fs = require('fs');
const sequelize = require('./config/database');
const { DataTypes } = require('sequelize');

// ===== 1. DEFINE MODEL =====
const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: false },
  nip: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.STRING,
}, { timestamps: false });

const Pegawai = sequelize.define('Pegawai', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: false },
  nama: DataTypes.STRING,
  nip: DataTypes.STRING,
  jabatan: DataTypes.STRING,
  unit_kerja: DataTypes.STRING,
  status: DataTypes.STRING,
}, { timestamps: false });

const Tupoksi = sequelize.define('Tupoksi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jabatan: DataTypes.STRING,
  tugas: DataTypes.JSON,
}, { timestamps: false });

const Kinerja = sequelize.define('Kinerja', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: false },
  nip: { type: DataTypes.STRING, allowNull: true },
  skp_id: { type: DataTypes.STRING, allowNull: true },
  tipe: { type: DataTypes.STRING, allowNull: true },
  rhk_pimpinan: { type: DataTypes.TEXT, allowNull: true },
  rencana_hasil_kerja: { type: DataTypes.TEXT, allowNull: true },
  aspek: { type: DataTypes.STRING, allowNull: true },
  indikator: { type: DataTypes.TEXT, allowNull: true },
  target: { type: DataTypes.STRING, allowNull: true },
  updatedAt: { type: DataTypes.DATE, allowNull: true },
  score: { type: DataTypes.STRING, allowNull: true },
  tupoksi: { type: DataTypes.TEXT, allowNull: true },
  skp_tahunan_ai: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: false });

const SkpPeriodik = sequelize.define('SkpPeriodik', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  aplikasi: DataTypes.STRING,
  instansi: DataTypes.STRING,
  data: DataTypes.JSON,
}, { timestamps: false });

const Penilaian = sequelize.define('Penilaian', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: false },
  skp_periodik_id: { type: DataTypes.STRING, allowNull: true },
  bukti_dukung: { type: DataTypes.STRING, allowNull: true },
  realisasi: { type: DataTypes.STRING, allowNull: true },
  penilaian: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: false });

// ===== 2. FUNGSI MIGRASI =====
async function migrateAll() {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi MySQL berhasil!');

    // Hapus semua tabel dulu (biar fresh)
    await sequelize.drop();
    console.log('✅ Tabel lama dihapus!');

    await sequelize.sync({ force: false });
    console.log('✅ Tabel berhasil dibuat!');

    // ===== 3. IMPORT DATA =====
    const daftarFile = [
      { model: User, file: 'users.json' },
      { model: Pegawai, file: 'pegawai.json' },
      { model: Tupoksi, file: 'tupoksi.json' },
      { model: Kinerja, file: 'kinerja.json' },
      { model: SkpPeriodik, file: 'skp_periodik.json' },
      { model: Penilaian, file: 'penilaian.json' },
    ];

    for (const item of daftarFile) {
      const path = `./data/${item.file}`;
      if (fs.existsSync(path)) {
        try {
          const raw = fs.readFileSync(path, 'utf-8');
          let data = JSON.parse(raw);
          if (!Array.isArray(data)) {
            data = [data];
          }

          console.log(`📥 Importing ${item.file} (${data.length} records)...`);
          await item.model.bulkCreate(data);
          console.log(`✅ ${item.file} → ${data.length} data berhasil diimport`);
        } catch (error) {
          console.error(`❌ Gagal di ${item.file}:`);
          console.error(`   Pesan: ${error.message}`);
          
          // Tampilkan detail error dari Sequelize
          if (error.errors) {
            console.error(`   Detail Validation Error:`);
            error.errors.forEach((err, index) => {
              console.error(`   ${index + 1}. Field: ${err.path}`);
              console.error(`      Value: ${err.value}`);
              console.error(`      Message: ${err.message}`);
            });
          }
          
          // Hentikan proses karena ada error
          process.exit(1);
        }
      } else {
        console.log(`⚠️ File ${item.file} tidak ditemukan, dilewati`);
      }
    }

    console.log('🎉 SEMUA MIGRASI SELESAI!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal koneksi:', error.message);
    process.exit(1);
  }
}

migrateAll();
