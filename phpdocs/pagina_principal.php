<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Página Principal - Accesos</title>
    <style>
        * {
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #1d6fa5, #4a90e2);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .main-container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            width: 380px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .main-container h1 {
            margin-bottom: 25px;
            color: #2c3e50;
        }

        .login-links {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .login-links a {
            text-decoration: none;
            padding: 12px;
            background-color: #4a90e2;
            color: white;
            border-radius: 6px;
            font-size: 16px;
            transition: background-color 0.3s, transform 0.2s;
        }

        .login-links a:hover {
            background-color: #357abd;
            transform: scale(1.03);
        }

        footer {
            margin-top: 25px;
            font-size: 13px;
            color: #777;
        }
    </style>
</head>
<body>

    <div class="main-container">
        <h1>Acceso al Sistema</h1>

        <div class="login-links">
            <a href="login_administrador.php">Login Administrador</a>
            <a href="login_usuario.php">Login Usuario</a>
            <a href="login_validador.php">Login Usuario Validador</a>
        </div>

        <footer>
            © 2025 Sistema de Validación
        </footer>
    </div>

</body>
</html>
