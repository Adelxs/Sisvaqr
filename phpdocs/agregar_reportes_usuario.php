<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Agregar Reporte</title>
    <style>
        * {
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            background-color: #f4f6f9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .form-container {
            background-color: #ffffff;
            padding: 30px;
            width: 420px;
            border-radius: 10px;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
        }

        .form-container h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #2c3e50;
        }

        label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
            color: #555;
        }

        input[type="date"],
        textarea,
        input[type="file"] {
            width: 100%;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #ccc;
            font-size: 14px;
        }

        textarea {
            resize: none;
            height: 100px;
        }

        input[type="file"] {
            padding: 6px;
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: #4a90e2;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover {
            background-color: #357abd;
        }
    </style>
</head>
<body>

    <div class="form-container">
        <h2>Agregar Reporte</h2>

        <form>
            <label for="fecha">Fecha</label>
            <input type="date" id="fecha" name="fecha" required>

            <label for="descripcion">Descripción</label>
            <textarea
                id="descripcion"
                name="descripcion"
                placeholder="Ingrese la descripción del reporte"
                required
            ></textarea>

            <label for="imagenes">Imágenes</label>
            <input
                type="file"
                id="imagenes"
                name="imagenes"
                accept="image/*"
                multiple
            >

            <button type="submit">Guardar Reporte</button>
        </form>
        <button onclick="window.location.href='panel_usuario.php'" 
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
    </div>

</body>
</html>
