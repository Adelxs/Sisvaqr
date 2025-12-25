<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel - Usuario Validador</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            background-color: #f4f6f9;
        }

        /* Navbar */
        .navbar {
            background-color: #2c3e50;
            color: white;
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .navbar .logo {
            font-size: 18px;
            font-weight: bold;
        }

        .navbar ul {
            list-style: none;
            display: flex;
            gap: 20px;
        }

        .navbar ul li {
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 5px;
            transition: background-color 0.3s;
        }

        .navbar ul li:hover {
            background-color: #34495e;
        }

        /* Contenido principal */
        .container {
            padding: 30px;
        }

        .card {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
            margin-bottom: 10px;
            color: #2c3e50;
        }

        .card p {
            color: #555;
        }

        a {
            color: white;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar">
        <div class="logo">Panel Validador</div>
        <ul>
            <li>Historial de escaneo QR</li>
            <li>Perfil usuario validador</li>
            <li><a href="agregar_reportes_validador.php">Agregar reportes</a></li>
            <li><a href="login_validador.php" style="color: #ff6b6b;">Cerrar sesión</a></li>
        </ul>
    </nav>

    <!-- Contenido -->
    <div class="container">
        <div class="card">
            <h2>Bienvenido, usuario validador</h2>
            <p>
                Desde este panel puedes revisar el historial de escaneos QR,
                administrar tu perfil y agregar nuevos reportes.
            </p>
        </div>
    </div>

</body>
</html>
