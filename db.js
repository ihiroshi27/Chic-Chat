const mysql = require('mysql');
const config = require('./config');

const pool = mysql.createPool(config.db);

module.exports = pool;