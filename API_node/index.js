/*const http = require('node:http');
const pool = require('./db.js');

const desiredPort = process.env.PORT ?? 1234;

const server = http.createServer(async (req, res) => {
  console.log('URL solicitada:', req.url);

  if (req.url.startsWith('/usuarios')) {
    console.log('Entró a /usuarios');
    try {
      const [rows] = await pool.query('SELECT * FROM usuarios');
      console.log('Datos consultados:', rows);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows));
    } catch (error) {
      console.error('Error en consulta:', error);
      res.writeHead(500);
      res.end('Error en base de datos');
    }
    return;
  }

  res.end('Hola mundo');
});

server.listen(desiredPort, () => {
  console.log(`Server listening on http://localhost:${desiredPort}`);
});*/


const express = require('express');
const cors = require('cors');
const pool = require('./db.js');

const app = express();
const desiredPort = process.env.PORT ?? 1234;

app.use(cors());          // Permite acceso desde PHP u otros puertos
app.use(express.json());  // Para recibir JSON en POST/PUT

// ------------ RUTA GET USUARIOS ---------------- //
app.get('/usuarios', async (req, res) => {
  console.log('Entró a /usuarios');

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    console.log('Datos consultados:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error en consulta:', error);
    res.status(500).json({ error: 'Error en base de datos' });
  }
});

// ------------ RUTA DE PRUEBA ---------------- //
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando');
});

// ------------ INICIAR SERVIDOR ---------------- //
app.listen(desiredPort, () => {
  console.log(`API escuchando en http://localhost:${desiredPort}`);
});
