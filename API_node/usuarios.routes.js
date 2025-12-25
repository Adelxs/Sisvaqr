module.exports = function (app, pool) {

    // -------------------------------------------
    // GET → Listar todos los usuarios
    // -------------------------------------------
    app.get('/usuarios', async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM Usuarios');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error consultando usuarios' });
        }
    });

    // -------------------------------------------
    // GET → Obtener usuario por Código_Usuario
    // -------------------------------------------
    app.get('/usuarios/:codigo', async (req, res) => {
        const { codigo } = req.params;

        try {
            const [rows] = await pool.query(
                'SELECT * FROM Usuarios WHERE Codigo_Usuario = ?',
                [codigo]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Error consultando usuario' });
        }
    });

    // -------------------------------------------
    // POST → Crear usuario
    // -------------------------------------------
    app.post('/usuarios', async (req, res) => {
        const { Codigo_Usuario, Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario } = req.body;

        if (!Codigo_Usuario || !Contraseña || !RUT || !Nombre_y_Apellido || !Tipo_de_Usuario) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        try {
            await pool.query(
                `INSERT INTO Usuarios (Codigo_Usuario, Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario)
                 VALUES (?, ?, ?, ?, ?)`,
                [Codigo_Usuario, Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario]
            );

            res.json({ ok: true, mensaje: 'Usuario creado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error creando usuario', detalles: error });
        }
    });

    // -------------------------------------------
    // PUT → Actualizar usuario
    // -------------------------------------------
    app.put('/usuarios/:codigo', async (req, res) => {
        const { codigo } = req.params;
        const { Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario } = req.body;

        try {
            const [result] = await pool.query(
                `UPDATE Usuarios 
                 SET Contraseña = ?, RUT = ?, Nombre_y_Apellido = ?, Tipo_de_Usuario = ?
                 WHERE Codigo_Usuario = ?`,
                [Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario, codigo]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ ok: true, mensaje: 'Usuario actualizado correctamente' });

        } catch (error) {
            res.status(500).json({ error: 'Error actualizando usuario' });
        }
    });

    // -------------------------------------------
    // DELETE → Eliminar usuario
    // -------------------------------------------
    app.delete('/usuarios/:codigo', async (req, res) => {
        const { codigo } = req.params;

        try {
            const [result] = await pool.query(
                'DELETE FROM Usuarios WHERE Codigo_Usuario = ?',
                [codigo]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' });

        } catch (error) {
            res.status(500).json({ error: 'Error eliminando usuario' });
        }
    });
};
