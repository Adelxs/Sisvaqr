<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Actualizar Usuario</title>
</head>
<body>
    <h2>Actualizar Usuario por RUT</h2>
    <form method="POST">
        <label for="rut">RUT del usuario:</label><br>
        <input type="text" name="RUT" id="rut" required><br><br>

        <label for="nombre">Nombre y Apellido:</label><br>
        <input type="text" name="Nombre_y_Apellido" id="nombre"><br><br>

        <label for="tipo">Tipo de Usuario:</label><br>
        <input type="text" name="Tipo_de_Usuario" id="tipo"><br><br>

        <label for="pass">Contraseña:</label><br>
        <input type="password" name="Contraseña" id="pass"><br><br>

        <input type="submit" value="Actualizar Usuario">
    </form>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = [
        "Contraseña" => $_POST['Contraseña'] ?: null,
        "Nombre_y_Apellido" => $_POST['Nombre_y_Apellido'] ?: null,
        "Tipo_de_Usuario" => $_POST['Tipo_de_Usuario'] ?: null
    ];

    $rut = $_POST['RUT'];
    $url = "http://localhost:1234/usuarios/rut/" . urlencode($rut);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($httpCode === 200 && isset($result['ok'])) {
        echo "<h3>Usuario actualizado correctamente vía API.</h3>";
    } else {
        echo "<h3>Error al actualizar usuario</h3>";
        echo "<pre>";
        print_r($result);
        echo "</pre>";
    }
}
?>

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
</body>
</html>
