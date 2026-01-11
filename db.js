const mysql = require('mysql2/promise');

let pool;

if (process.env.MYSQL_URL) {
  // ✅ Railway o cualquier entorno con URL completa
  pool = mysql.createPool(process.env.MYSQL_URL);
  console.log('✅ Conectando a MySQL usando MYSQL_URL');
} else {
  // ✅ Entorno local
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbsisvaqr',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('✅ Conectando a MySQL en local');
}

module.exports = pool;
