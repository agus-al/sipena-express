const fs = require('fs');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sipena'
});

db.connect((err) => {
  if (err) {
    console.log('❌ Gagal konek:', err.message);
    return;
  }
  console.log('✅ Koneksi MySQL berhasil');
});

// Baca file
const rawData = fs.readFileSync('./data/skp_periodik.json', 'utf8');
const json = JSON.parse(rawData);

// Ambil array hasil_kerja dari dalam data
let records = [];
if (json.data && Array.isArray(json.data)) {
  json.data.forEach(item => {
    if (item.hasil_kerja && Array.isArray(item.hasil_kerja)) {
      records = records.concat(item.hasil_kerja);
    }
  });
}

console.log(`📊 Menemukan ${records.length} record`);

if (records.length === 0) {
  console.log('⚠️ Tidak ada data ditemukan');
  process.exit(0);
}

// Buat tabel
const sample = records[0];
let columns = 'id BIGINT PRIMARY KEY';
Object.keys(sample).forEach(key => {
  if (key !== 'id') {
    // Handle nested object (target_bulanan)
    if (typeof sample[key] === 'object' && sample[key] !== null) {
      columns += `, \`${key}\` TEXT`;
    } else {
      columns += `, \`${key}\` TEXT`;
    }
  }
});

// Tambahan kolom untuk periode
columns += `, periode_bulan INT, periode_tahun INT, nama_bulan VARCHAR(50)`;

db.query(`DROP TABLE IF EXISTS skp_periodik`);
db.query(`CREATE TABLE skp_periodik (${columns})`, (err) => {
  if (err) {
    console.log('❌ Gagal buat tabel:', err.message);
    return;
  }
  console.log('✅ Tabel skp_periodik dibuat');
});

// Insert data
let inserted = 0;
records.forEach(item => {
  // Ambil periode dari parent
  const periode = json.data[0]?.periode || {};
  
  const data = {
    ...item,
    periode_bulan: periode.bulan || null,
    periode_tahun: periode.tahun || null,
    nama_bulan: periode.nama_bulan || null,
    // Convert object ke string
    target_bulanan: JSON.stringify(item.target_bulanan || {}),
    rencana_aksi: JSON.stringify(item.rencana_aksi || [])
  };
  
  db.query(`INSERT INTO skp_periodik SET ?`, data, (err) => {
    if (err) {
      console.log('❌ Error insert:', err.message);
    } else {
      inserted++;
    }
  });
});

setTimeout(() => {
  console.log(`✅ skp_periodik selesai (${inserted} record)`);
  process.exit(0);
}, 2000);
