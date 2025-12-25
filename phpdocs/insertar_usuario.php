<?php

$conexion = new mysqli("localhost", "root", "", "dbsisvaqr");

// Mostrar errores de MySQL
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$codigo = $_POST['Codigo_Usuario'];
$pass = $_POST['Contraseña'];
$rut = $_POST['RUT'];
$nombre = $_POST['Nombre_y_Apellido'];
$tipo = $_POST['Tipo_de_Usuario'];

// Ver qué datos están llegando
echo "<pre>";
echo "Código: $codigo\n";
echo "Pass: $pass\n";
echo "RUT: $rut\n";
echo "Nombre: $nombre\n";
echo "Tipo: $tipo\n";
echo "</pre>";

$sql = "INSERT INTO usuarios (Codigo_Usuario, Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario)
        VALUES ('$codigo', '$pass', '$rut', '$nombre', '$tipo')";

if ($conexion->query($sql)) {
    echo "<h3>Usuario registrado correctamente.</h3>";
} else {
    echo "<h3>Error al registrar:</h3>";
    echo $conexion->error;
}

$conexion->close();

?>

<br><br>
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
