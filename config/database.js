const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    dialect: 'mysql',
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      },
      connectTimeout: 30000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    },
    pool: {
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 5000,
      evict: 4000
    },
    retry: { max: 2 },
    logging: false
  }
);

module.exports = sequelize;
