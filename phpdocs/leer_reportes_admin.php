<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Administrador</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            background-color: #eef1f5;
        }

        /* Navbar */
        .navbar {
            background-color: #1f2d3d;
            color: #ffffff;
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
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .navbar ul li:hover {
            background-color: #2c3e50;
        }

        /* Contenido */
        .container {
            padding: 30px;
        }

        .card {
            background-color: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
            max-width: 600px;
        }

        .card h2 {
            margin-bottom: 15px;
            color: #1f2d3d;
        }

        .card p {
            color: #555;
        }
    </style>
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar">
        <div class="logo">Panel Administrador</div>
        <ul>
            <li>Designar encargado</li>
        </ul>
    </nav>

    <!-- Contenido -->
    <div class="container">
        <div class="card">
            <h2>Designar Encargado</h2>
            <p>
                Desde este panel el administrador puede asignar un encargado
                a una tarea, área o reporte específico.
            </p>
        </div>
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
    </div>
   

</body>
</html>
