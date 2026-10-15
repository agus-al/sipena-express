const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      },
      // Timeout koneksi cepat agar tidak menggantung lama
      connectTimeout: 10000 
    },
    // SANGAT PENTING UNTUK VERCEL SERVERLESS:
    pool: {
      max: 2,         // Cukup 1-2 koneksi saja untuk serverless
      min: 0,         // Biarkan 0 agar koneksi idle dibuang
      acquire: 30000, // Waktu maksimal mengambil koneksi (ms)
      idle: 5000      // Putus koneksi yang menganggur setelah 5 detik
    },
    logging: false
  }
);

module.exports = sequelize;



