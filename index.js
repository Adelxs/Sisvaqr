// Solo cargar dotenv en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const pool = require('./db.js');
const usuariosRoutes = require('./usuarios.routes.js');
const fs = require('fs');
const path = require('path');
const app = express();
// Railway SIEMPRE usa este puerto
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads', 'reportes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Servir imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
usuariosRoutes(app, pool);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando en Railway 🚀');
});


app.post('/auth/panel', async (req, res) => {
    const { RUT, Contrasena } = req.body;

    if (!RUT || !Contrasena) {
        return res.status(400).json({
            ok: false,
            error: 'RUT y contraseña obligatorios'
        });
    }

    if (!validarRUT(RUT)) {
        return res.status(400).json({
            ok: false,
            error: 'RUT inválido'
        });
    }

    try {
        const [rows] = await pool.query(
            `SELECT 
                Codigo_Usuario,
                Contrasena,
                Nombre_y_Apellido,
                Tipo_de_Usuario
             FROM Usuarios
             WHERE RUT = ?`,
            [RUT]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: 'Usuario no existe'
            });
        }

        const usuario = rows[0];

        const passwordOK = await bcrypt.compare(Contrasena, usuario.Contrasena);
        if (!passwordOK) {
            return res.status(401).json({
                ok: false,
                error: 'Contraseña incorrecta'
            });
        }

        // Registrar acceso al panel
        await pool.query(
            `INSERT INTO Historial_de_Acciones 
             (Codigo_Usuario, Accion, Hora_Accion)
             VALUES (?, ?, NOW())`,
            [usuario.Codigo_Usuario, 'Acceso a panel']
        );

        res.json({
            ok: true,
            usuario: {
                Codigo_Usuario: usuario.Codigo_Usuario,
                Nombre_y_Apellido: usuario.Nombre_y_Apellido,
                Tipo_de_Usuario: usuario.Tipo_de_Usuario
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error interno del servidor'
        });
    }
});



app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});

