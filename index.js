// Solo cargar dotenv en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const pool = require('./db.js');
const usuariosRoutes = require('./usuarios.routes.js');

const app = express();

// Railway SIEMPRE usa este puerto
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir imágenes
app.use('/uploads', express.static('uploads'));

// Rutas
usuariosRoutes(app, pool);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando en Railway 🚀');
});

app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});

