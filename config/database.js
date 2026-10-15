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
      connectTimeout: 10000 // Timeout 10 detik agar cepat merespon
    },
    // PENTING: Pengaturan pool untuk Vercel Serverless
    pool: {
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 5000
    },
    logging: false
  }
);

module.exports = sequelize;
