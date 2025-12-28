const express = require('express');
const cors = require('cors');
const pool = require('./db.js');
const usuariosRoutes = require('./usuarios.routes.js');

const app = express();
const desiredPort = process.env.PORT ?? 1234;

app.use(cors());
app.use(express.json());

// Pasar app y pool a las rutas
usuariosRoutes(app, pool);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor Express funcionando');
});

app.listen(desiredPort, () => {
    console.log(`API escuchando en http://localhost:${desiredPort}`);
});

