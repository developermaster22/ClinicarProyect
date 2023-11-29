<?php
// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "1234Cesar";
$dbname = "clinicar";

// Conexión a la base de datos
try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}

