const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // 1. Tambahkan ini

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sipena',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectModule: mysql2, // 2. TAMBAHKAN BARIS INI (Wajib untuk Vercel!)
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
);

module.exports = sequelize;


