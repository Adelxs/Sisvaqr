<?php
header("Content-Type: application/json");

$conexion = new mysqli("localhost", "root", "", "dbsisvaqr");

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($conexion->connect_error) {
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}

if (!isset($_GET['rut'])) {
    echo json_encode(["error" => "No se recibió el código"]);
    exit;
}

$rut = $conexion->real_escape_string($_GET['rut']);

$sql = "SELECT RUT, Nombre_y_Apellido, Tipo_de_Usuario FROM usuarios WHERE RUT = '$rut'";
$result = $conexion->query($sql);

$usuarios = [];

while ($fila = $result->fetch_assoc()) {
    $usuarios[] = $fila;
}

echo json_encode($usuarios);


$conexion->close();
?>
