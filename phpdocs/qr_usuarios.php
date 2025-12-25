<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Generar QR de Usuarios</title>

<style>
    body {
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        padding: 20px;
    }

    h2 {
        text-align: center;
    }

    .usuario {
        background: white;
        padding: 20px;
        margin: 15px 0;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .datos {
        width: 60%;
    }

    canvas {
        border: 1px solid #ddd;
        padding: 10px;
        background: #fff;
    }
</style>
</head>
<body>

<h2>Códigos QR de Usuarios</h2>

<div id="contenedor"></div>

<script src="qrious.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>


<script>

const urlParams = new URLSearchParams(window.location.search);
const rut = urlParams.get("rut");

// Obtener los usuarios desde el archivo PHP
fetch("listar_usuarios.php?rut=" + rut)
    .then(res => res.json())
    .then(usuarios => {

        const contenedor = document.getElementById("contenedor");

        usuarios.forEach(u => {

            // Crear contenedor de usuario
            let div = document.createElement("div");
            div.className = "usuario";

            // Datos que irán dentro del QR
            let textoQR = 
                //`Código: ${u.Codigo_Usuario}\n` +
                //`Contraseña: ${u.Contraseña}\n` +
                `RUT: ${u.RUT}\n` +
                `Nombre: ${u.Nombre_y_Apellido}\n` +
                `Tipo: ${u.Tipo_de_Usuario}`;

            // Crear elemento canvas
            let canvas = document.createElement("canvas");

            // Generar QR
            new QRious({
                element: canvas,
                size: 160,
                value: textoQR
            });

            // HTML con los datos
            div.innerHTML = `
                <div class="datos">
                    <!--<strong>Código:</strong> ${u.Codigo_Usuario}<br>
                    <strong>Contraseña:</strong> ${u.Contraseña}<br>-->
                    <strong>RUT:</strong> ${u.RUT}<br>
                    <strong>Nombre:</strong> ${u.Nombre_y_Apellido}<br>
                    <strong>Tipo:</strong> ${u.Tipo_de_Usuario}
                </div>
            `;

            // Agregar canvas al bloque
            div.appendChild(canvas);

            // Agregar al contenedor principal
            contenedor.appendChild(div);
        });

    })
    .catch(err => {
        console.error("Error al cargar usuarios:", err);
    });
</script>

</body>
</html>

<?php
$conexion = new mysqli("localhost", "root", "", "dbsisvaqr");
$rut = $_GET['rut'];

$stmt = $conexion->prepare("SELECT Codigo_Usuario FROM usuarios WHERE RUT = ?");
$stmt->bind_param("s", $rut);
$stmt->execute();
$stmt->bind_result($codigo);
$stmt->fetch();
$stmt->close();

$accion = "Generó código QR del usuario $rut";
$stmt = $conexion->prepare("INSERT INTO historial_de_acciones (Codigo_Usuario, Accion, Hora_Accion) VALUES (?, ?, NOW())");
$stmt->bind_param("ss", $codigo, $accion);
$stmt->execute();
$stmt->close();

$conexion->close();


?>

<button onclick="window.location.href='login_usuario.php'" 
        style="
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 15px;
            margin-top: 15px;
        ">
    Cerrar sesión
</button>


