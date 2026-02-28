if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const bcrypt = require('bcrypt');
const upload = require('./config/multer'); 

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');


function validarRUT(rut) {
    if (!rut) return false;

    // Quitar puntos y guión
    rut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

    if (rut.length < 2) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
    }

    const resto = suma % 11;
    const dvEsperado = 11 - resto;

    let dvCalculado;
    if (dvEsperado === 11) dvCalculado = '0';
    else if (dvEsperado === 10) dvCalculado = 'K';
    else dvCalculado = dvEsperado.toString();

    return dv === dvCalculado;
}


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
    const {
        Codigo_Usuario,
        Contraseña,
        RUT,
        Correo_Electronico,
        Nombre_y_Apellido,
        Tipo_de_Usuario
    } = req.body;

    // 🔹 Validación de campos
    if (!Codigo_Usuario || !Contraseña || !RUT || !Correo_Electronico || !Nombre_y_Apellido || !Tipo_de_Usuario) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    // 🔹 VALIDAR RUT
    if (!validarRUT(RUT)) {
        return res.status(400).json({ error: 'RUT inválido' });
    }

    try {
        const hash = await bcrypt.hash(Contraseña, 10);

        // 🔹 Insertar en tabla Usuarios
        await pool.query(
            `INSERT INTO Usuarios 
            (Codigo_Usuario, Contrasena, RUT, Correo_Electronico, Nombre_y_Apellido, Tipo_de_Usuario)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [Codigo_Usuario, hash, RUT, Correo_Electronico, Nombre_y_Apellido, Tipo_de_Usuario]
        );

        // 🔹 Si es Administrador, insertar en encargados
        if (Tipo_de_Usuario === "Administrador") {
            await pool.query(
                `INSERT INTO encargados (Nombre, RUT, Correo)
                VALUES (?, ?, ?)`,
                [Nombre_y_Apellido, RUT, Correo_Electronico]
            );
        }

        res.json({
            ok: true,
            mensaje: 'Usuario creado correctamente'
        });

    } catch (error) {
        console.error("Error creando usuario:", error);
        res.status(500).json({
            error: 'Error creando usuario'
        });
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
        await pool.query('DELETE FROM Historial_de_Acciones WHERE Codigo_Usuario = ?', [codigoUsuario]);

        // Luego eliminar usuario
        const [result] = await pool.query('DELETE FROM Usuarios WHERE RUT = ?', [rut]);

        res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error eliminando usuario' });
    }
});


// PUT usuario por RUT
app.put('/usuarios/rut/:rut', async (req, res) => {
    const { rut } = req.params;
    const { Contraseña, Nombre_y_Apellido, Tipo_de_Usuario, Correo_Electronico } = req.body;

    if (!Contraseña && !Nombre_y_Apellido && !Tipo_de_Usuario && !Correo_Electronico) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    try {
        const [rows] = await pool.query('SELECT Codigo_Usuario FROM Usuarios WHERE RUT = ?', [rut]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const codigoUsuario = rows[0].Codigo_Usuario;

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
                 Tipo_de_Usuario = COALESCE(?, Tipo_de_Usuario),
                 Correo_Electronico = COALESCE(?, Correo_Electronico)
             WHERE RUT = ?`,
            [hash, Nombre_y_Apellido, Tipo_de_Usuario, Correo_Electronico, rut]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const hora = new Date();
        await pool.query(
            `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion)
             VALUES (?, ?, ?)`,
            [codigoUsuario, `Se actualizó el RUT ${rut}`, hora]
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

    // 🔹 VALIDAR RUT (antes de consultar BD)
    if (!validarRUT(RUT)) {
        return res.status(400).json({ error: 'RUT inválido' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT Codigo_Usuario, Contrasena, Tipo_de_Usuario FROM Usuarios WHERE RUT = ?',
            [RUT]
        );

        // 🔹 RUT válido pero no existe
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no existe' });
        }

        const usuario = rows[0];

        // 🔹 Validar contraseña
        const passwordOK = await bcrypt.compare(Contraseña, usuario.Contrasena);
        if (!passwordOK) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // 🔹 Registrar login
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


/* agregar reportes */
app.post('/reportes', upload.array('imagenes', 5), async (req, res) => {
    const { Codigo_Usuario, Titulo, Categoria, Detalles } = req.body;

    if (!Codigo_Usuario || !Titulo) {
        return res.status(400).json({ error: 'Codigo_Usuario y Titulo son obligatorios' });
    }

    try {
        console.log('=== NUEVO REPORTE ===');
        console.log('Datos recibidos:', { Codigo_Usuario, Titulo, Categoria, Detalles });

        // 1️⃣ Insertar el reporte
        const [resultado] = await pool.query(
            `INSERT INTO Lista_de_Reportes 
             (Codigo_Usuario, Titulo, Categoria, Detalles)
             VALUES (?, ?, ?, ?)`,
            [Codigo_Usuario, Titulo, Categoria || null, Detalles || null]
        );


        const id_reporte = resultado.insertId;
        console.log('Reporte insertado con ID:', id_reporte);

        // 2️⃣ Guardar imágenes (si existen)
        if (req.files && req.files.length > 0) {
            console.log('Archivos a guardar:', req.files.map(f => f.path));
            for (const img of req.files) {
                try {
                    await pool.query(
                        `INSERT INTO Reporte_Imagenes (ID_Reporte, Ruta_Imagen)
                         VALUES (?, ?)`,
                        [id_reporte, img.path]
                    );
                } catch (imgError) {
                    console.error('Error insertando imagen:', img.path, imgError.message);
                }
            }
        } else {
            console.log('No se recibieron imágenes');
        }

        // 3️⃣ Obtener el RUT del usuario
        const [usuarioRows] = await pool.query(
            `SELECT RUT FROM Usuarios WHERE Codigo_Usuario = ?`,
            [Codigo_Usuario]
        );

        const rut_usuario = usuarioRows.length > 0 ? usuarioRows[0].RUT : 'Desconocido';
        console.log('RUT del usuario:', rut_usuario);

        // 4️⃣ Insertar historial
        const accion = `Reporte de RUT: ${rut_usuario}`;
        console.log('Insertando historial:', accion);
        await pool.query(
            `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion)
             VALUES (?, ?, NOW())`,
            [Codigo_Usuario, accion]
        );

        res.json({
            ok: true,
            id_reporte,
            mensaje: 'Reporte agregado correctamente'
        });

    } catch (error) {
        console.error('Error en /reportes:', error);
        res.status(500).json({ 
            error: 'Error al agregar el reporte', 
            details: error.message // <-- muestra el error real en frontend
        });
    }
});



// GET /reportes
app.get('/reportes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
           SELECT 
    r.ID_Reporte,
    r.Codigo_Usuario,
    r.Titulo,
    r.Categoria,
    r.Detalles,
    r.Fecha,
    r.Estado,
    e.ID_Encargado,
    e.Nombre AS Encargado,
    i.Ruta_Imagen
FROM Lista_de_Reportes r
LEFT JOIN Reporte_Encargado re
    ON r.ID_Reporte = re.ID_Reporte
LEFT JOIN encargados e
    ON re.ID_Encargado = e.ID_Encargado
LEFT JOIN Reporte_Imagenes i 
    ON r.ID_Reporte = i.ID_Reporte
ORDER BY r.Fecha DESC
        `);

        const reportesMap = {};

        for (const row of rows) {
            if (!reportesMap[row.ID_Reporte]) {
                reportesMap[row.ID_Reporte] = {
                    ID_Reporte: row.ID_Reporte,
                    Codigo_Usuario: row.Codigo_Usuario,
                    Titulo: row.Titulo,
                    Categoria: row.Categoria,
                    Detalles: row.Detalles,
                    Fecha: row.Fecha,
                    Estado: row.Estado,
                    Encargado: row.Encargado,
                    imagenes: []
                };
            }

       if (row.Ruta_Imagen) {
    // Quitar "/app/" si está al inicio
    const rutaPublica = `https://sisvaqr-production.up.railway.app/${row.Ruta_Imagen.replace(/^\/?app\//, '')}`;
    reportesMap[row.ID_Reporte].imagenes.push(rutaPublica);
}

        }

        res.json({
            ok: true,
            reportes: Object.values(reportesMap)
        });

    } catch (error) {
        console.error("Error real en MySQL:", error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener los reportes'
        });
    }
});


// trae los usuarios a perfil
app.get('/usuario/:codigo', async (req, res) => {
    const codigoUsuario = req.params.codigo;

    try {
        const [rows] = await pool.query(`
            SELECT Codigo_Usuario, RUT, Correo_Electronico, Nombre_y_Apellido, Tipo_de_Usuario
            FROM Usuarios
            WHERE Codigo_Usuario = ?
            LIMIT 1
        `, [codigoUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
        }

        res.json({ ok: true, usuario: rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: 'Error al obtener datos del usuario' });
    }
});


// Asignar encargado a un reporte
app.post('/reportes/:id/asignar', async (req, res) => {
    const { id } = req.params; // ID del reporte
    const { ID_Encargado } = req.body; // ID del encargado

    if (!ID_Encargado) return res.status(400).json({ error: 'Debe enviar el ID del encargado' });

    try {
        // Verificar si ya está asignado
        const [existe] = await pool.query(
            `SELECT * FROM Reporte_Encargado WHERE ID_Reporte = ?`,
            [id]
        );
        if (existe.length > 0) {
            return res.status(400).json({ error: 'Reporte ya tiene un encargado asignado' });
        }

        // Obtener el nombre del encargado
        const [encargadoRows] = await pool.query(
            `SELECT Nombre FROM encargados WHERE ID_Encargado = ?`,
            [ID_Encargado]
        );

        if (encargadoRows.length === 0) {
            return res.status(400).json({ error: 'Encargado no encontrado' });
        }

        const nombreEncargado = encargadoRows[0].Nombre;

        // Insertar en la tabla Reporte_Encargado
        await pool.query(
            `INSERT INTO Reporte_Encargado (ID_Reporte, ID_Encargado) VALUES (?, ?)`,
            [id, ID_Encargado]
        );

        // Actualizar estado y nombre del encargado en Lista_de_Reportes
        await pool.query(
            `UPDATE Lista_de_Reportes SET Estado = 'Asignado' WHERE ID_Reporte = ?`,
            [id]
        );

        res.json({ ok: true, mensaje: 'Encargado asignado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error asignando encargado', detalles: error });
    }
});


// Cerrar (eliminar) reporte
app.delete('/reportes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            `DELETE FROM Lista_de_Reportes WHERE ID_Reporte = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        res.json({ ok: true, mensaje: 'Reporte cerrado/eliminado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error cerrando reporte', detalles: error });
    }
});

// Obtener todos los encargados
app.get('/encargados', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT ID_Encargado, Nombre FROM encargados`
        );
        res.json({ encargados: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo encargados' });
    }
});

/*cambiar contraseña*/
/* recuperar contraseña usando Gmail con contraseña de aplicación */



  app.post('/usuarios/recuperar-password', async (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ mensaje: 'Correo requerido' });

    try {
      // Buscar usuario por correo
      const [rows] = await pool.query(
        'SELECT Codigo_Usuario FROM Usuarios WHERE Correo_Electronico = ?',
        [correo]
      );

      if (rows.length === 0) {
        // No mostrar información sensible
        return res.json({ mensaje: 'Si el correo existe, recibirás instrucciones' });
      }

      const codigo = rows[0].Codigo_Usuario;
      const token = uuidv4();
      const expira = new Date(Date.now() + 15 * 60000); // expira en 15 minutos

      // Marcar anteriores tokens como usados (opcional)
      await pool.query(
        'UPDATE Recuperacion_Password SET usado = 1 WHERE Codigo_Usuario = ?',
        [codigo]
      );

      // Insertar nuevo token
      await pool.query(
        'INSERT INTO Recuperacion_Password (Codigo_Usuario, token, expira) VALUES (?, ?, ?)',
        [codigo, token, expira]
      );

      // Configurar transporter con contraseña de aplicación
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,       // tu correo Gmail
          pass: process.env.MAIL_PASS        // contraseña de aplicación de 16 caracteres
        }
      });

      const link = `http://localhost/reset_password.php?token=${token}`;

      // Enviar correo
      await transporter.sendMail({
        from: `"Soporte" <${process.env.MAIL_USER}>`,
        to: correo,
        subject: 'Recuperación de contraseña',
        html: `<p>Haz clic para cambiar tu contraseña:</p>
               <a href="${link}">${link}</a>`
      });

      res.json({ mensaje: 'Si el correo existe, recibirás instrucciones' });
    } catch (error) {
      console.error('Error recuperación:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  });

/*actualizar contraseña*/ 
    app.post('/usuarios/reset-password', async (req, res) => {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ mensaje: 'Datos incompletos' });

        try {
            const [rows] = await pool.query(
                'SELECT Codigo_Usuario, expira, usado FROM Recuperacion_Password WHERE token = ?',
                [token]
            );

            if (rows.length === 0) return res.status(400).json({ mensaje: 'Token inválido' });
            const { Codigo_Usuario, expira, usado } = rows[0];

            if (usado) return res.status(400).json({ mensaje: 'El token ya fue usado' });
            if (new Date(expira) < new Date()) return res.status(400).json({ mensaje: 'Token expirado' });

            const hash = await bcrypt.hash(password, 10);

            await pool.query(
                'UPDATE Usuarios SET Contrasena = ? WHERE Codigo_Usuario = ?',
                [hash, Codigo_Usuario]
            );

            await pool.query(
                'UPDATE Recuperacion_Password SET usado = 1 WHERE token = ?',
                [token]
            );

            res.json({ mensaje: 'Contraseña actualizada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    });


app.post('/usuarios/activar-2fa', async (req, res) => {
    const { RUT } = req.body;  // Recibe el usuario

    // Buscar usuario en la BD
    const [rows] = await pool.query('SELECT Codigo_Usuario FROM Usuarios WHERE RUT = ?', [RUT]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Generar secreto para Google Authenticator
    const secret = speakeasy.generateSecret({ length: 20, name: "SisVaQR" });

    // Guardar secret.base32 en la BD del usuario
    await pool.query('UPDATE Usuarios SET secret_2fa = ? WHERE RUT = ?', [secret.base32, RUT]);

    // Generar QR
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) return res.status(500).json({ error: 'Error generando QR' });
        res.json({ qr: data_url, secret: secret.base32 });
    });
});

app.get('/debug/uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  const dir = path.join(__dirname, 'uploads', 'reportes');

  if (!fs.existsSync(dir)) {
    return res.json({ existe: false, dir });
  }

  res.json({
    existe: true,
    archivos: fs.readdirSync(dir)
  });
});

// Suponiendo que ya tienes un login y guardas el código o RUT del usuario
/*app.get('/me', async (req, res) => {
    const { rut } = req.query;
    let accion = "Historial registrado";

    if (!rut) return res.status(400).json({ ok: false, error: "RUT requerido" });

    try {
        // 1. Buscamos al usuario
        const [rows] = await pool.query(
            `SELECT Codigo_Usuario, RUT, Nombre_y_Apellido, Tipo_de_Usuario 
             FROM Usuarios 
             WHERE RUT = ?`,
            [rut]
        );

        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: "Usuario no encontrado" });
        }

        // EXTRAEMOS el código correctamente del primer resultado
        const usuario = rows[0];
        const codigo = usuario.Codigo_Usuario;

        // 2. Registramos la acción (IMPORTANTE: Usar la variable 'codigo' que acabamos de extraer)
        try {
            await pool.query(
                `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Fecha_Accion)
                 VALUES (?, ?, NOW())`,
                [codigo, accion]
            );
        } catch (logErr) {
            // Si falla el log, no queremos que el usuario no pueda entrar, 
            // solo lo informamos en consola.
            console.error("Error al registrar en historial:", logErr);
        }

        // 3. Respondemos al cliente
        res.json({ ok: true, usuario: usuario });

    } catch (err) {
        console.error("Error crítico en /me:", err);
        res.status(500).json({ ok: false, error: "Error en servidor" });
    }
});*/

app.get('/me', async (req, res) => {
    const { rut, accion } = req.query; // Ahora extraemos 'accion' también
    
    // Si no mandas acción, usamos una por defecto
    const textoAccion = accion || "Acceso al sistema"; 

    if (!rut) return res.status(400).json({ ok: false, error: "RUT requerido" });

    try {
        const [rows] = await pool.query(
            `SELECT Codigo_Usuario, RUT, Nombre_y_Apellido, Tipo_de_Usuario 
             FROM Usuarios WHERE RUT = ?`,
            [rut]
        );

        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: "Usuario no encontrado" });
        }

        const usuario = rows[0];
        const codigo = usuario.Codigo_Usuario;

        // Registro en el historial con la acción dinámica
        try {
            await pool.query(
                `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Fecha_Accion)
                 VALUES (?, ?, NOW())`,
                [codigo, textoAccion]
            );
        } catch (logErr) {
            console.error("Error al registrar en historial:", logErr);
        }

        res.json({ ok: true, usuario: usuario });

    } catch (err) {
        console.error("Error crítico en /me:", err);
        res.status(500).json({ ok: false, error: "Error en servidor" });
    }
});

app.get('/usuario/:rut', async (req, res) => {
    const rut = req.params.rut;
    const [rows] = await pool.query('SELECT * FROM Usuarios WHERE RUT = ?', [rut]);
    if (rows.length === 0) return res.json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, usuario: rows[0] });
});


// POST /auth/panel

    // Aquí puedes agregar PUT, DELETE, GET por código si lo deseas

     app.post('/auth/panel', async (req, res) => {
    try {
      const { RUT, Contrasena } = req.body;

      // Validación básica
      if (!RUT || !Contrasena) {
        return res.status(400).json({
          ok: false,
          error: 'RUT y contraseña obligatorios'
        });
      }

      // Consulta BD
      const [rows] = await pool.query(
        'SELECT Codigo_Usuario, Contrasena, Tipo_de_Usuario FROM Usuarios WHERE RUT = ?',
        [RUT]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Usuario no existe'
        });
      }

      const usuario = rows[0];

      // Verificar hash válido bcrypt
      if (!usuario.Contrasena || !usuario.Contrasena.startsWith('$2')) {
        return res.status(500).json({
          ok: false,
          error: 'Contraseña no está hasheada en la base de datos'
        });
      }

      // Comparar contraseña
      const passwordOK = await bcrypt.compare(
        Contrasena,
        usuario.Contrasena
      );

      if (!passwordOK) {
        return res.status(401).json({
          ok: false,
          error: 'Contraseña incorrecta'
        });
      }

      // === NUEVA SENTENCIA SQL: REGISTRO DE ACCIÓN ===
      // Registramos el inicio de sesión antes de enviar la respuesta exitosa
      try {
          await pool.query(
            'INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion) VALUES (?, ?, NOW())',
            [usuario.Codigo_Usuario, 'Inicio de sesión celular']
          );
      } catch (logError) {
          // Usamos un try-catch interno para que, si falla el log, 
          // el usuario igual pueda entrar a la app.
          console.error('Error al registrar log de inicio:', logError);
      }
      // =============================================

      // Login exitoso
      return res.json({
        ok: true,
        codigo: usuario.Codigo_Usuario,
        rut: RUT,
        tipo: usuario.Tipo_de_Usuario
      });

    } catch (err) {
      console.error(' ERROR LOGIN:', err);

      // NUNCA HTML
      return res.status(500).json({
        ok: false,
        error: 'Error interno del servidor',
        detalle: err.message
      });
    }
  });


  //cambiar contraseña
  app.post('/usuarios/cambiar-password', async (req, res) => {
    try {
      const {
        Codigo_Usuario,
        password_actual,
        password_nueva
      } = req.body;

      if (!Codigo_Usuario || !password_actual || !password_nueva) {
        return res.status(400).json({
          ok: false,
          error: 'Datos incompletos'
        });
      }

      // Obtener contraseña actual
      const [rows] = await pool.query(
        'SELECT Contrasena FROM Usuarios WHERE Codigo_Usuario = ?',
        [Codigo_Usuario]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Usuario no encontrado'
        });
      }

      const hashActual = rows[0].Contrasena;

      // Verificar contraseña actual
      const passwordOK = await bcrypt.compare(
        password_actual,
        hashActual
      );

      if (!passwordOK) {
        return res.status(401).json({
          ok: false,
          error: 'Contraseña actual incorrecta'
        });
      }

      // Hashear nueva contraseña
      const nuevoHash = await bcrypt.hash(password_nueva, 10);

      // Actualizar
      await pool.query(
        'UPDATE Usuarios SET Contrasena = ? WHERE Codigo_Usuario = ?',
        [nuevoHash, Codigo_Usuario]
      );

      return res.json({
        ok: true,
        mensaje: 'Contraseña actualizada correctamente'
      });

    } catch (err) {
      console.error('🔥 ERROR CAMBIAR PASSWORD:', err);

      return res.status(500).json({
        ok: false,
        error: 'Error interno del servidor'
      });
    }
  });

 // 1. Asegúrate de que aquí diga :rut
app.get('/usuario/rut/:rut', async (req, res) => { 
    try {
        // 2. Aquí debes extraer el mismo nombre que pusiste arriba
        let rut = req.params.rut; 

        if (!rut) {
            return res.status(400).json({ ok: false, error: "No se recibió el RUT" });
        }

        console.log("🔍 Buscando RUT:", `"${rut}"`);
        rut = rut.replace(/\./g, '').trim().toUpperCase();

        const [rows] = await pool.query(
            'SELECT * FROM Usuarios WHERE RUT = ?',
            [rut]
        );

        if (rows.length === 0) {
            return res.json({ ok: false, error: 'Usuario no encontrado' });
        }

        res.json({ ok: true, usuario: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: 'Error en el servidor rut' });
    }
});

// GET reportes por usuario
// GET reportes por usuario desde la tabla correcta
app.get('/reportes/usuario/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        console.log(`🔍 Buscando reportes para: |${codigo}|`);

        const [rows] = await pool.query(
            'SELECT * FROM Lista_de_Reportes WHERE TRIM(Codigo_Usuario) = ? ORDER BY Fecha DESC',
            [codigo.trim()]
        );

        res.json({ 
            ok: true, 
            reportes: rows 
        });

    } catch (error) {
        console.error('🔥 Error en base de datos:', error);
        res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
});

// Endpoint para contar total de usuarios
app.get('/usuarios/conteo', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM Usuarios');
        res.json({ ok: true, total: rows[0].total });
    } catch (error) {
        console.error("Error en conteo:", error);
        res.status(500).json({ ok: false, error: "Error al contar" });
    }
});

/*prueba nuevo endpoint*/

/*app.post('/registrar-escaneo', async (req, res) => {
    // Recibimos Codigo_Usuario desde el QR/App
    const { RUT, ID_Reporte } = req.body;

    if (!RUT || !ID_Reporte) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    try {
        const hora = new Date();

        // 1. Buscamos el RUT asociado a ese Codigo_Usuario
        const [usuarios] = await pool.query(
            'SELECT * FROM Usuarios WHERE RUT = ?', 
            [RUT]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const rutUsuario = usuarios[0].RUT;

        // 2. Insertamos en el historial usando el RUT en la descripción de la acción
        // O si tu tabla historial tiene una columna RUT, cámbiala aquí:
        await pool.query(
            `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion) 
             VALUES (?, ?, ?)`,
            [Codigo_Usuario, `Escaneo QR ID: ${ID_Reporte} | Realizado por RUT: ${rutUsuario}`, hora]
        );

        res.json({ ok: true, mensaje: 'Escaneo registrado con éxito por RUT' });
    } catch (error) {
        console.error('Error al registrar escaneo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});*/

// POST /registrar-escaneo
app.post('/registrar-escaneo', async (req, res) => {
    const { Codigo_Usuario, ID_Reporte } = req.body;

    if (!Codigo_Usuario || !ID_Reporte) {
        return res.status(400).json({ error: 'Faltan datos (Codigo_Usuario o ID_Reporte)' });
    }

    try {
        const hora = new Date();
        // Insertamos en tu tabla existente 'Historial_de_Acciones'
        await pool.query(
            `INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion)
             VALUES (?, ?, ?)`,
            [Codigo_Usuario, `Escaneo Qr: ${ID_Reporte}`, hora]
        );

        res.json({ ok: true, mensaje: 'Escaneo registrado en el historial' });
    } catch (error) {
        console.error('Error al registrar escaneo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para contar solo los escaneos QR
app.get('/historial/conteo-escaneos', async (req, res) => {
    try {
        // Contamos filas donde la acción contenga "Escaneo Qr"
        const [rows] = await pool.query(
            "SELECT COUNT(*) as total FROM Historial_de_Acciones WHERE Accion LIKE 'Escaneo Qr%'"
        );
        
        res.json({ ok: true, total: rows[0].total });
    } catch (error) {
        console.error("Error en conteo de escaneos:", error);
        res.status(500).json({ ok: false, error: "Error en el servidor" });
    }
});

// Endpoint para contar todos los reportes de incidencias
app.get('/reportes/conteo', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT COUNT(*) as total FROM Lista_de_Reportes");
        res.json({ ok: true, total: rows[0].total });
    } catch (error) {
        console.error("Error en conteo de reportes:", error);
        res.status(500).json({ ok: false, error: "Error en el servidor" });
    }
});

// GET: Obtener todo el historial de acciones con nombre de usuario
app.get('/historial/acciones', async (req, res) => {
    try {
        const query = `
            SELECT h.ID_Accion, h.Accion, h.Hora_Accion, u.Nombre_y_Apellido 
            FROM Historial_de_Acciones h
            JOIN Usuarios u ON h.Codigo_Usuario = u.Codigo_Usuario
            ORDER BY h.Hora_Accion DESC 
            LIMIT 50
        `;
        const [rows] = await pool.query(query);
        res.json({ ok: true, historial: rows });
    } catch (error) {
        console.error("Error al traer historial:", error);
        res.status(500).json({ ok: false, error: "Error interno" });
    }
});

// Endpoint para contar el total de acciones registradas
app.get('/historial/conteo-total', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM Historial_de_Acciones');
        res.json({ ok: true, total: rows[0].total });
    } catch (error) {
        console.error("Error en conteo de historial:", error);
        res.status(500).json({ ok: false, error: "Error al contar" });
    }
});

// Endpoint para buscar usuario por RUT
app.get('/usuario_por_rut/:rut', async (req, res) => {
    const { rut } = req.params;

    try {
        const [usuarios] = await pool.query(
            'SELECT RUT, Nombre_y_Apellido, Tipo_de_Usuario, Codigo_Usuario, Correo_Electronico FROM Usuarios WHERE RUT = ?',
            [rut]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
        }

        res.json({ ok: true, usuario: usuarios[0] });
    } catch (error) {
        console.error('Error al buscar usuario por RUT:', error);
        res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
});
  
};







