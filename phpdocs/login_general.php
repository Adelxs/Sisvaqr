<?php
session_start();

$error = "";

// Si el formulario fue enviado
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    if (!isset($_POST['rut'], $_POST['password'])) {
        $error = "Debe ingresar RUT y contraseña";
    } else {

        $rut = trim($_POST['rut']);
        $clave = trim($_POST['password']); // Eliminamos espacios por seguridad

        // Crear JSON para la API
        $datos = json_encode([
            "RUT" => $rut,
            "Contraseña" => $clave
        ], JSON_UNESCAPED_UNICODE);

        $ch = curl_init("http://localhost:1234/login"); // Ajusta puerto si es necesario
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $datos);

        $respuesta = curl_exec($ch);

        if ($respuesta === false) {
            $error = "No se pudo conectar al servidor de login";
        } else {
            $resultado = json_decode($respuesta, true);

            if (!$resultado) {
                $error = "Respuesta inválida del servidor";
            } elseif (isset($resultado['ok']) && $resultado['ok'] === true) {
                // Login exitoso
                $_SESSION['codigo_usuario'] = $resultado['codigo'];
                $_SESSION['tipo_usuario'] = $resultado['tipo'];
                $_SESSION['rut_usuario'] = $rut;

                // Redirigir según tipo de usuario
                switch ($resultado['tipo']) {
                    case 'Administrador':
                        header("Location: panel_administrador.php");
                        exit;
                    case 'Usuario':
                        header("Location: panel_usuario.php");
                        exit;
                    case 'Validador':
                        header("Location: panel_validador.php");
                        exit;
                    default:
                        $error = "Rol de usuario no válido";
                }

            } elseif (isset($resultado['error'])) {
                // Mostrar error que envía la API (contraseña incorrecta, usuario no encontrado, etc.)
                $error = $resultado['error'];
            } else {
                $error = "RUT o contraseña incorrectos";
            }
        }

        curl_close($ch);
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <style>
        body {
            font-family: Arial;
            background: #f5f5f5;
        }
        .login {
            width: 320px;
            margin: 120px auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
        input, button {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
        .error {
            color: red;
            margin-top: 10px;
            text-align: center;
        }
    </style>
</head>
<body>

<div class="login">
    <h2>Iniciar Sesión</h2>

    <form method="POST">
        <input type="text" name="rut" placeholder="RUT" required>
        <input type="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Ingresar</button>
    </form>

    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
</div>

</body>
</html>
