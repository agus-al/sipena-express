const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // Wajib untuk Vercel / serverless

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sipena',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectModule: mysql2, // Mencegah error modul mysql di lingkungan serverless Vercel
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false // Membuka izin koneksi SSL ke TiDB Cloud
      }
    }
  }
);

module.exports = sequelize;



