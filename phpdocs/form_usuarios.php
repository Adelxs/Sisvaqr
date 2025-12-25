<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registro de Usuarios</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f2f5;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            background: white;
            padding: 25px;
            border-radius: 10px;
            width: 380px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }

        label {
            font-weight: bold;
            display: block;
            margin-top: 12px;
            color: #444;
        }

        input, select {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border-radius: 5px;
            border: 1px solid #aaa;
            font-size: 14px;
        }

        input:focus, select:focus {
            border-color: #005bbb;
            outline: none;
            box-shadow: 0 0 5px rgba(0,91,187,0.4);
        }

        button {
            width: 100%;
            margin-top: 20px;
            padding: 12px;
            background: #005bbb;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: 0.3s;
        }

        button:hover {
            background: #004799;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Registrar Usuario</h2>

    <form action="insertar_usuario.php" method="POST">

        <label for="codigo">Código de Usuario</label>
        <input type="text" id="codigo" name="Codigo_Usuario" maxlength="10" required>

        <label for="password">Contraseña</label>
        <input type="password" id="password" name="Contraseña" maxlength="15" required>

        <label for="rut">RUT</label>
        <input type="text" id="rut" name="RUT" maxlength="10" required>

        <label for="nombre">Nombre y Apellido</label>
        <input type="text" id="nombre" name="Nombre_y_Apellido" maxlength="100" required>

        <label for="tipo">Tipo de Usuario</label>
        <select id="tipo" name="Tipo_de_Usuario" required>
            <option value="">Seleccione...</option>
            <option value="Administrador">Administrador</option>
            <option value="Usuario">Usuario</option>
            <option value="Invitado">Invitado</option>
        </select>

        <button type="submit">Guardar Usuario</button>
        <button onclick="window.location.href='panel_administrador.php'" 
        style="
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 15px;
        ">
    Volver al panel
</button>
    </form>
</div>

</body>
</html>
