<?php
session_start();

$usuario_admin = "validador";
$password_admin = "12345";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = $_POST["usuario"];
    $password = $_POST["password"];

    if ($usuario === $usuario_admin && $password === $password_admin) {
        $_SESSION["validador"] = true;
        header("Location: panel_validador.php");
        exit();
    } else {
        $error = "Usuario o contraseña incorrectos";
    }
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login - Usuario Validador</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #4a90e2, #357abd);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
        }

        .login-container {
            background-color: #ffffff;
            padding: 30px;
            width: 320px;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .login-container h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }

        .login-container label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: bold;
        }

        .login-container input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 5px;
            border: 1px solid #ccc;
            font-size: 14px;
        }

        .login-container input[readonly] {
            background-color: #f0f0f0;
            cursor: not-allowed;
        }

        .login-container button {
            width: 100%;
            padding: 10px;
            background-color: #4a90e2;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }

        .login-container button:hover {
            background-color: #357abd;
        }

    </style>
</head>
<body>

    <div class="login-container">
        <h2>Iniciar Sesión</h2>

        <form method="POST" action="">
            <label for="usuario">Usuario</label>
            <input 
                type="text" 
                id="usuario" 
                name="usuario" 
                value="validador" 
                readonly
            >

            <label for="password">Contraseña</label>
            <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Ingrese su contraseña"
                required
            >

            <button type="submit">Ingresar</button>
        </form>
    </div>

</body>
</html>
