<?php
$host = "localhost";
$usuario = "root";
$contrasena = ""; 
$base_datos = "dbsisvaqr";

$conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

/* ----------------- CREAR TABLAS -------------------- */

$sqlTablas = "
CREATE TABLE IF NOT EXISTS Categoria (
    Categoria VARCHAR(15) NOT NULL,
    PRIMARY KEY (Categoria)
);

CREATE TABLE IF NOT EXISTS Tipo_de_Usuario (
    Tipo_de_Usuario VARCHAR(15) NOT NULL,
    PRIMARY KEY (Tipo_de_Usuario)
);

CREATE TABLE IF NOT EXISTS Usuarios (
    Codigo_Usuario VARCHAR(10) NOT NULL,
    Contraseña VARCHAR(15) NOT NULL,
    RUT VARCHAR(10) NOT NULL,
    Nombre_y_Apellido VARCHAR(100) NOT NULL,
    Tipo_de_Usuario VARCHAR(15) NOT NULL,
    PRIMARY KEY (Codigo_Usuario),
    FOREIGN KEY (Tipo_de_Usuario) REFERENCES Tipo_de_Usuario(Tipo_de_Usuario)
);

CREATE TABLE IF NOT EXISTS Registro_Acceso (
    ID_Registro INT AUTO_INCREMENT NOT NULL,
    Codigo_Usuario VARCHAR(10) NOT NULL,
    Dato_Desconocido_1 VARCHAR(10),
    Dato_Desconocido_2 VARCHAR(100),
    PRIMARY KEY (ID_Registro),
    FOREIGN KEY (Codigo_Usuario) REFERENCES Usuarios(Codigo_Usuario)
);

CREATE TABLE IF NOT EXISTS Historial_de_Acciones (
    ID_Accion INT AUTO_INCREMENT NOT NULL,
    Codigo_Usuario VARCHAR(10) NOT NULL,
    Accion VARCHAR(30),
    Hora_Accion DATETIME,
    PRIMARY KEY (ID_Accion),
    FOREIGN KEY (Codigo_Usuario) REFERENCES Usuarios(Codigo_Usuario)
);

CREATE TABLE IF NOT EXISTS Historial_de_Reportes (
    ID_Reporte INT AUTO_INCREMENT NOT NULL,
    Codigo_Usuario VARCHAR(10) NOT NULL,
    RUT VARCHAR(10),
    Nombre_y_Apellido VARCHAR(100),
    Categoria VARCHAR(15) NOT NULL,
    Detalles_del_Incidente VARCHAR(1000),
    Fecha DATETIME,
    Anexos VARCHAR(1000),
    Encargado_de_Resolucion VARCHAR(100),
    Estado_del_Incidente VARCHAR(100),
    Respuesta_al_Incidente VARCHAR(1000),
    PRIMARY KEY (ID_Reporte),
    FOREIGN KEY (Codigo_Usuario) REFERENCES Usuarios(Codigo_Usuario),
    FOREIGN KEY (Categoria) REFERENCES Categoria(Categoria)
);

CREATE TABLE IF NOT EXISTS Historial_de_Acceso (
    ID_Historial INT AUTO_INCREMENT NOT NULL,
    Codigo_Usuario VARCHAR(10) NOT NULL,
    ID_Registro INT NOT NULL,
    RUT VARCHAR(10),
    Nombre_y_Apellido VARCHAR(100),
    Codigo_QR VARCHAR(100),
    Hora_y_Fecha_de_Salida DATETIME,
    Hora_y_Fecha_de_Ingreso DATETIME,
    PRIMARY KEY (ID_Historial),
    FOREIGN KEY (Codigo_Usuario) REFERENCES Usuarios(Codigo_Usuario),
    FOREIGN KEY (ID_Registro) REFERENCES Registro_Acceso(ID_Registro)
);
";

if ($conexion->multi_query($sqlTablas)) {
    echo "Tablas creadas correctamente.<br>";
} else {
    echo "Error al crear tablas: " . $conexion->error . "<br>";
}

// Necesario para limpiar multi_query()
while ($conexion->next_result()) {}

/* -------------------- INSERTS ---------------------- */

$inserts = [
    "INSERT INTO Tipo_de_Usuario (Tipo_de_Usuario) VALUES ('Administrador')",
    "INSERT INTO Categoria (Categoria) VALUES ('Hardware')",
    "INSERT INTO Usuarios (Codigo_Usuario, Contraseña, RUT, Nombre_y_Apellido, Tipo_de_Usuario) VALUES ('U001', 'clave123', '12345678-9', 'Juan Perez', 'Administrador')",
    "INSERT INTO Registro_Acceso (Codigo_Usuario, Dato_Desconocido_1, Dato_Desconocido_2) VALUES ('U001', 'DatoA', 'Informacion B')",
    "INSERT INTO Historial_de_Acciones (Codigo_Usuario, Accion, Hora_Accion) VALUES ('U001', 'Login Exitoso', NOW())",
    "INSERT INTO Historial_de_Reportes (Codigo_Usuario, RUT, Nombre_y_Apellido, Categoria, Detalles_del_Incidente, Fecha, Anexos, Encargado_de_Resolucion, Estado_del_Incidente, Respuesta_al_Incidente) VALUES ('U001', '12345678-9', 'Juan Perez', 'Hardware', 'El monitor no enciende.', NOW(), 'foto_monitor.jpg', 'Soporte TI', 'Abierto', 'Reporte recibido, se asignará técnico.')",
    "INSERT INTO Historial_de_Acceso (Codigo_Usuario, ID_Registro, RUT, Nombre_y_Apellido, Codigo_QR, Hora_y_Fecha_de_Salida, Hora_y_Fecha_de_Ingreso) VALUES ('U001', 1, '12345678-9', 'Juan Perez', 'QR_DATA_EXAMPLE_001', NULL, NOW())"
];

foreach ($inserts as $i => $query) {
    if ($conexion->query($query) === TRUE) {
        echo "Insert " . ($i + 1) . " ejecutado correctamente.<br>";
    } else {
        echo "Error en insert " . ($i + 1) . ": " . $conexion->error . "<br>";
    }
}

echo "Proceso finalizado correctamente.";
?>
