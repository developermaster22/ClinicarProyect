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

// Obtener la fecha actual
$fecha_actual = date("Y-m-d");

// Consultar los servicios realizados hoy
$statement = $conn->prepare("SELECT * FROM servicio_info WHERE DATE(fecha_servicio) = :fecha_actual");
$statement->bindParam(":fecha_actual", $fecha_actual);
$statement->execute();

// Obtener resultados
$servicios = $statement->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Servicios de Hoy</title>
</head>
<body>
    <h2>Servicios de Hoy</h2>

    <?php if (count($servicios) > 0) : ?>
        <table border="1">
            <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Tipo de Servicio</th>
                <th>Fecha de Servicio</th>
                <th>Número de Servicio</th>
                <th>Patente Asociada</th>
            </tr>
            <?php foreach ($servicios as $servicio) : ?>
                <tr>
                    <td><?php echo $servicio['id']; ?></td>
                    <td><?php echo $servicio['cliente_id']; ?></td>
                    <td><?php echo $servicio['vehiculo_id']; ?></td>
                    <td><?php echo $servicio['tipo_servicio']; ?></td>
                    <td><?php echo $servicio['fecha_servicio']; ?></td>
                    <td><?php echo $servicio['n_servicio']; ?></td>
                    <td><?php echo $servicio['patente_asoc']; ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    <?php else : ?>
        <p>No hay servicios realizados hoy.</p>
    <?php endif; ?>
    
</body>
</html>
<?php require "partials/footer.php" ?>
