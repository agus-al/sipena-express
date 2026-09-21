const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sipena', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql',
  port: 3306,
  logging: false,
});

module.exports = sequelize;
