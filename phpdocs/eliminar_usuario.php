<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Eliminar Usuario</title>
</head>
<body>
    <h2>Eliminar Usuario por RUT</h2>
    <form method="POST">
        <label for="rut">RUT del usuario:</label><br>
        <input type="text" name="RUT" id="rut" required><br><br>
        <input type="submit" value="Eliminar Usuario">
    </form>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rut = $_POST['RUT'];

    $url = "http://localhost:1234/usuarios/rut/" . urlencode($rut);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE"); // Método DELETE

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($httpCode === 200 && isset($result['ok'])) {
        echo "<h3>Usuario eliminado correctamente vía API.</h3>";
    } else {
        echo "<h3>Error al eliminar usuario</h3>";
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
