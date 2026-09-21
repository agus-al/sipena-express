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

const files = fs.readdirSync('./data').filter(f => f.endsWith('.json'));

console.log('📁 File ditemukan:', files);

const processFile = (index) => {
  if (index >= files.length) {
    console.log('🎉 Selesai!');
    return;
  }

  const file = files[index];
  console.log(`📄 Proses ${file}...`);
  
  try {
    const rawData = fs.readFileSync(`./data/${file}`, 'utf8');
    const data = JSON.parse(rawData);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`⚠️ ${file} skip (bukan array atau kosong)`);
      processFile(index + 1);
      return;
    }
    
    const table = file.replace('.json', '');
    
    // 🔥 AMBIL SEMUA KOLOM dari SEMUA data (bukan cuma data pertama)
    const allKeys = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Buat kolom otomatis
    let columns = 'id BIGINT PRIMARY KEY';
    allKeys.forEach(key => {
      if (key !== 'id') {
        columns += `, \`${key}\` TEXT`;
      }
    });
    
    console.log(`📋 Membuat tabel ${table} dengan kolom:`, Array.from(allKeys));
    
    db.query(`DROP TABLE IF EXISTS ${table}`);
    db.query(`CREATE TABLE ${table} (${columns})`);
    
    // 🔥 UBAH array/object jadi JSON string
    let inserted = 0;
    data.forEach(item => {
      const processedItem = {};
      Object.keys(item).forEach(key => {
        const value = item[key];
        // Kalo value-nya object/array, ubah jadi JSON string
        if (typeof value === 'object' && value !== null) {
          processedItem[key] = JSON.stringify(value);
        } else {
          processedItem[key] = value;
        }
      });
      
      db.query(`INSERT INTO ${table} SET ?`, processedItem, (err) => {
        if (err) {
          console.log(`❌ Error insert:`, err.message);
        } else {
          inserted++;
        }
      });
    });
    
    console.log(`✅ ${file} selesai (${data.length} record)`);
    
  } catch (error) {
    console.log(`❌ Gagal proses ${file}:`, error.message);
  }
  
  setTimeout(() => processFile(index + 1), 500);
};

processFile(0);
