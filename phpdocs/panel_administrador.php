<?php
session_start();

if (!isset($_SESSION["admin"]) || $_SESSION["admin"] !== true) {
    header("Location: login_administrador.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel de Administrador</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<style>
    /* --- Estilos del navbar --- */
    .navbar {
        background: #333;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        position: relative;
    }

    .navbar .logo {
        font-size: 20px;
        font-weight: bold;
    }

    .navbar ul {
        list-style: none;
        display: flex;
        gap: 20px;
        margin: 0;
        padding: 0;
    }

    .navbar ul li a {
        color: white;
        text-decoration: none;
        font-size: 16px;
    }

    /* --- Botón hamburguesa --- */
    .divspan {
        display: none;
        flex-direction: column;
        cursor: pointer;
    }

    .divspan span {
        background: white;
        width: 25px;
        height: 3px;
        margin: 4px;
        transition: 0.3s;
    }

     a {
            color: white;
            text-decoration: none;
        }

    /* --- Responsive --- */
    @media (max-width: 900px) {
        .navbar ul {
            display: none;
            flex-direction: column;
            background: #333;
            position: absolute;
            top: 60px;
            right: 0;
            width: 200px;
            padding: 10px;
        }

        .navbar ul.active {
            display: flex;
        }

        .divspan {
            display: flex;
        }
    }
</style>
<body>
    <nav class="navbar">
    <div class="logo">Panel de Administración</div>

    <ul id="menu">
        <li><a href="form_usuarios.php">Creación de usuarios</a></li>
        <li><a href="ver_usuarios.php">Ver usuarios actuales</a></li>
        <li><a href="eliminar_usuario.php">Eliminar usuarios</a></li>
        <li><a href="actualizar_usuario.php">Actualizar usuarios</a></li>
        <li><a href="leer_reportes_admin.php">Leer reportes</a></li>
        <li><a href="dias_festivos.php">Ver días festivos</a></li>
        <li><a href="calendario.php">Ver calendario</a></li>
        <li><a href="agregar_reportes_admin.php">Agregar reportes</a></li>
        <li><a href="login_administrador.php" style="color: #ff6b6b;">Cerrar sesión</a></li>
    </ul>

    <div class="divspan" onclick="toggleMenu()">
        <span></span>
        <span></span>
        <span></span>
    </div>
</nav>

<script>
    function toggleMenu() {
        document.getElementById("menu").classList.toggle("active");
    }
</script>
    <h1>Bienvenido, Administrador</h1>
    <p>Has iniciado sesión correctamente.</p>

</body>
</html>