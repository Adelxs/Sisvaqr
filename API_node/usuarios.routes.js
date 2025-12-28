const bcrypt = require('bcrypt');

module.exports = function(app, pool) {

    // GET todos los usuarios
    app.get('/usuarios', async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM Usuarios');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error consultando usuarios' });
        }
    });

    // POST crear usuario con contraseña encriptada
    app.post('/usuarios', async (req, res) => {
        const { Codigo_Usuario, Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario } = req.body;
        if (!Codigo_Usuario || !Contraseña || !RUT || !Nombre_y_Apellido || !Tipo_de_Usuario) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        try {
            const hash = await bcrypt.hash(Contraseña, 10);
            await pool.query(
                `INSERT INTO Usuarios (Codigo_Usuario, Contrasena, RUT, Nombre_y_Apellido, Tipo_de_Usuario)
                 VALUES (?, ?, ?, ?, ?)`,
                [Codigo_Usuario, hash, RUT, Nombre_y_Apellido, Tipo_de_Usuario]
            );

            res.json({ ok: true, mensaje: 'Usuario creado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error creando usuario', detalles: error });
        }
    });

    // POST historial
    app.post('/historial', async (req, res) => {
        const { Codigo_Usuario, Accion } = req.body;
        if (!Codigo_Usuario || !Accion) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        try {
            const hora = new Date();
            await pool.query(
                `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion)
                 VALUES (?, ?, ?)`,
                [Codigo_Usuario, Accion, hora]
            );
            res.json({ ok: true, mensaje: 'Historial registrado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error registrando historial' });
        }
    });

    // DELETE usuario por RUT
app.delete('/usuarios/rut/:rut', async (req, res) => {
    const { rut } = req.params;

    try {
        // Obtener el Codigo_Usuario correspondiente al RUT
        const [usuarios] = await pool.query('SELECT Codigo_Usuario FROM Usuarios WHERE RUT = ?', [rut]);

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const codigoUsuario = usuarios[0].Codigo_Usuario;

        // Eliminar historial asociado
        await pool.query('DELETE FROM historial_de_acciones WHERE Codigo_Usuario = ?', [codigoUsuario]);

        // Luego eliminar usuario
        const [result] = await pool.query('DELETE FROM usuarios WHERE RUT = ?', [rut]);

        res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error eliminando usuario' });
    }
});


// PUT usuario por RUT
app.put('/usuarios/rut/:rut', async (req, res) => {
    const { rut } = req.params;
    const { Contraseña, Nombre_y_Apellido, Tipo_de_Usuario } = req.body;

    if (!Contraseña && !Nombre_y_Apellido && !Tipo_de_Usuario) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    try {
        // 🔹 Obtener Código_Usuario real
        const [rows] = await pool.query('SELECT Codigo_Usuario FROM Usuarios WHERE RUT = ?', [rut]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const codigoUsuario = rows[0].Codigo_Usuario;

        // 🔐 Encriptar contraseña si viene
        let hash = null;
        if (Contraseña) {
            const bcrypt = require('bcrypt');
            hash = await bcrypt.hash(Contraseña, 10);
        }

        // 🔹 Actualizar solo los campos que llegan
        const [result] = await pool.query(
            `UPDATE Usuarios
             SET Contrasena = COALESCE(?, Contrasena),
                 Nombre_y_Apellido = COALESCE(?, Nombre_y_Apellido),
                 Tipo_de_Usuario = COALESCE(?, Tipo_de_Usuario)
             WHERE RUT = ?`,
            [hash, Nombre_y_Apellido, Tipo_de_Usuario, rut]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 🔹 Registrar acción en historial usando Código_Usuario
        const hora = new Date();
        await pool.query(
            `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion)
             VALUES (?, ?, ?)`,
            [codigoUsuario, `Se actualizó el usuario con RUT ${rut}`, hora]
        );

        res.json({ ok: true, mensaje: 'Usuario actualizado correctamente' });

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error actualizando usuario', detalles: error });
    }
});

// POST login
app.post('/login', async (req, res) => {
    const { RUT, Contraseña } = req.body;

    if (!RUT || !Contraseña) {
        return res.status(400).json({ error: 'RUT y contraseña obligatorios' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT Codigo_Usuario, Contrasena, Tipo_de_Usuario FROM Usuarios WHERE RUT = ?',
            [RUT]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = rows[0];

        const passwordOK = await bcrypt.compare(Contraseña, usuario.Contrasena);
        if (!passwordOK) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Registrar login en historial
        await pool.query(
            `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion)
             VALUES (?, ?, NOW())`,
            [usuario.Codigo_Usuario, 'Inicio sesión']
        );

        res.json({
            ok: true,
            tipo: usuario.Tipo_de_Usuario,
            codigo: usuario.Codigo_Usuario
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el login' });
    }
});

// POST /reportes
// POST /reportes
app.post('/reportes', async (req, res) => {
    const { Codigo_Usuario, Titulo, Categoria, Detalles } = req.body;

    // Validaciones básicas
    if (!Codigo_Usuario || !Titulo) {
        return res.status(400).json({ error: 'Codigo_Usuario y Titulo son obligatorios' });
    }

    try {
        // 1️⃣ Insertar el reporte
        const [resultado] = await pool.query(
            `INSERT INTO lista_de_reportes (Codigo_Usuario, Titulo, Categoria, Detalles)
             VALUES (?, ?, ?, ?)`,
            [Codigo_Usuario, Titulo, Categoria || null, Detalles || null]
        );

        const id_reporte = resultado.insertId;

        // 2️⃣ Obtener el RUT del usuario
        const [usuarioRows] = await pool.query(
            `SELECT RUT FROM Usuarios WHERE Codigo_Usuario = ?`,
            [Codigo_Usuario]
        );

        let rut_usuario = usuarioRows.length > 0 ? usuarioRows[0].RUT : 'Desconocido';

        // 3️⃣ Insertar en Historial_de_Acciones
        const accion = `Reporte agregado por el usuario. RUT: ${rut_usuario}`;
        await pool.query(
            `INSERT INTO historial_de_acciones (Codigo_Usuario, Accion, Hora_Accion)
             VALUES (?, ?, NOW())`,
            [Codigo_Usuario, accion]
        );

        res.json({
            ok: true,
            id_reporte,
            mensaje: 'Reporte agregado correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el reporte' });
    }
});

// GET /reportes
app.get('/reportes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                ID_Reporte,
                Codigo_Usuario,
                Titulo,
                Categoria,
                Detalles,
                Fecha,
                Estado
            FROM Lista_de_Reportes
            ORDER BY Fecha DESC
        `);

        res.json({
            ok: true,
            reportes: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener los reportes'
        });
    }
});


    // Aquí puedes agregar PUT, DELETE, GET por código si lo deseas
};

