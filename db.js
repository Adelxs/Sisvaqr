const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',   // en XAMPP normalmente no hay contraseña
  database: 'dbsisvaqr'
});

module.exports = pool;
