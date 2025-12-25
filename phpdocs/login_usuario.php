<?php
/*session_start();
$error = '';

// Si el formulario se envió
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $codigo = $_POST['codigo'] ?? '';
    $contrasena = $_POST['contrasena'] ?? '';

    // Llamar a la API para obtener el usuario
    $response = file_get_contents("http://localhost:1234/usuarios/$codigo");
    $usuario = json_decode($response, true);

    if ($usuario && $usuario['Contraseña'] === $contrasena) {
        // Login exitoso
        $_SESSION['usuario'] = $usuario;
        header('Location: panel_usuario.php');
        exit;
    } else {
        $error = 'Código de usuario o contraseña incorrectos';
    }
}*/
?>

<?php
session_start();

$usuario_admin = "user";
$password_admin = "12345";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = $_POST["usuario"];
    $password = $_POST["password"];

    if ($usuario === $usuario_admin && $password === $password_admin) {
        $_SESSION["admin"] = true;
        header("Location: panel_usuario.php");
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
    <title>Login Usuario</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f8;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        form {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        input[type=text], input[type=password] {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .error {
            color: red;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <form method="POST">
        <h2>Login Usuario</h2>
        <?php /*if ($error) echo "<div class='error'>$error</div>";*/ ?>
        <input type="text" name="usuario" placeholder="Código de Usuario" required>
        <input type="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Ingresar</button>
    </form>
</body>
</html>
