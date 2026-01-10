require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db.js');
const usuariosRoutes = require('./usuarios.routes.js');



const app = express();
const desiredPort = process.env.PORT ?? 1234;

app.use(cors());
app.use(express.json());

// Servir imágenes
app.use('/uploads', express.static('uploads'));

// Rutas
usuariosRoutes(app, pool);

app.get('/', (req, res) => {
    res.send('Servidor Express funcionando');
});

console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('MAIL_PASS:', process.env.MAIL_PASS);

app.listen(desiredPort, () => {
    console.log(`API escuchando en http://localhost:${desiredPort}`);
});

