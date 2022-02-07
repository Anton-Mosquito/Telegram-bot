const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
  'telega_bot',
  'root',
  'root',
  {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres'
  }
  )