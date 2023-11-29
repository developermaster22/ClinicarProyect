<?php require "partials/header.php" ?>



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

// Iniciar sesión
session_start();

// Validar el formulario de agregar servicio
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    
    $tipo_servicio = $_POST["tipo_servicio"];
    $fecha_servicio = $_POST["fecha_servicio"];
    $patente_asoc = $_POST["patente_asoc"];

    // Insertar el servicio en la base de datos
    $statement = $conn->prepare("INSERT INTO servicio_info (tipo_servicio, fecha_servicio, patente_asoc) VALUES (:tipo_servicio, :fecha_servicio, :patente_asoc)");
    
    $statement->bindParam(":tipo_servicio", $tipo_servicio);
    $statement->bindParam(":fecha_servicio", $fecha_servicio);
    $statement->bindParam(":patente_asoc", $patente_asoc);

    try {
        $statement->execute();
        $success_message = "Servicio agregado exitosamente.";
    } catch (PDOException $e) {
        $error_message = "Error al agregar el servicio: " . $e->getMessage();
    }
}

// Obtener la lista de clientes y vehículos
$clientes = $conn->query("SELECT * FROM info_cliente")->fetchAll(PDO::FETCH_ASSOC);
$vehiculos = $conn->query("SELECT * FROM vehiculo")->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Servicio</title>
</head>
<body>
    <h2>Agregar Servicio</h2>
    
    <?php if (isset($error_message)) : ?>
        <p style="color: red;"><?php echo $error_message; ?></p>
    <?php endif; ?>

    <?php if (isset($success_message)) : ?>
        <p style="color: green;"><?php echo $success_message; ?></p>
    <?php endif; ?>

    <form action="add_service.php" method="post">
        <label for="cliente_id">Cliente:</label>
        <select name="cliente_id" id="cliente_id" required>
            <?php foreach ($clientes as $cliente) : ?>
                <option value="<?php echo $cliente['id']; ?>"><?php echo $cliente['nombre']; ?></option>
            <?php endforeach; ?>
        </select>
        <br>

        <label for="vehiculo_id">Vehículo:</label>
        <select name="vehiculo_id" id="vehiculo_id" required>
            <?php foreach ($vehiculos as $vehiculo) : ?>
                <option value="<?php echo $vehiculo['id']; ?>"><?php echo $vehiculo
                 ['modelo']; ?></option>
            <?php endforeach; ?>
        </select>
        <br>

        <label for="tipo_servicio">Tipo de Servicio:</label>
        <select name="tipo_servicio" id="tipo_servicio" required>
            <?php foreach ($servicios as $servicio_info) : ?>
                <option value="<?php echo $servicio_info['id']; ?>"><?php echo $servicio_info
                 ['tipo_servicio']; ?></option>
            <?php endforeach; ?>
        </select>
        <br>

        <label for="fecha_servicio">Fecha de Servicio:</label>
        <input type="text" name="fecha_servicio" id="fecha_servicio" required>
        <label for="patente_asoc">Patente Asociada:</label>
<select name="patente_asoc" id="patente_asoc" required>
    <?php foreach ($vehiculos as $vehiculo) : ?>
        <option value="<?php echo $vehiculo['patente']; ?>"><?php echo $vehiculo['patente']; ?></option>
    <?php endforeach; ?>
</select>
<br>

        <input type="submit" value="Agregar Servicio">
    </form>
</body>
</html>

<?php require "partials/footer.php" ?>
