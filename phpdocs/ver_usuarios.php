<?php
// 1️⃣ Llamar a la API
$response = file_get_contents("http://localhost:1234/usuarios");
$usuarios = json_decode($response, true);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Usuarios</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f8;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #007bff;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f1f1f1;
        }
    </style>
</head>
<body>
    <h1>Lista de Usuarios</h1>
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>RUT</th>
                <th>Nombre y Apellido</th>
                <th>Tipo de Usuario</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($usuarios as $usuario): ?>
                <tr>
                    <td><?php echo htmlspecialchars($usuario['Codigo_Usuario']); ?></td>
                    <td><?php echo htmlspecialchars($usuario['RUT']); ?></td>
                    <td><?php echo htmlspecialchars($usuario['Nombre_y_Apellido']); ?></td>
                    <td><?php echo htmlspecialchars($usuario['Tipo_de_Usuario']); ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <button onclick="window.location.href='panel_administrador.php'" 
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
    Volver al panel
</button>
</body>
</html>