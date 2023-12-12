<?php

require "database.php";

$error = null;

try {
    // Preparar la sentencia SQL, asegurándose de que los nombres de las columnas estén entre comillas invertidas si son necesarias
    $stmt = $conn->prepare("INSERT INTO `user_admin` (`usuario`, `contraseña`) VALUES (:usuario, :contrasena)");

    // Encriptar la contraseña
    $hashedPassword = password_hash("kevindgp", PASSWORD_DEFAULT);

    // Vincular los parámetros y ejecutar
    $stmt->execute(array(
        "usuario" => "kevin",
        "contrasena" => $hashedPassword // Asegúrate de que esto coincide con el nombre del marcador en la sentencia SQL.
    ));

    echo "Usuario insertado con éxito.";
} catch (PDOException $e) {
    // Manejar el error
    $error = "Error al insertar usuario: " . $e->getMessage();
    echo $error;
}

?>





