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
$fecha_actual = date("Y-m-d H:i:s");

$fecha_inicio = $fecha_actual . " 00:00:00";
$fecha_fin = $fecha_actual . " 23:59:59";

$statement = $conn->prepare("SELECT * FROM servicio_info WHERE fecha_servicio BETWEEN :fecha_inicio AND :fecha_fin");
$statement->bindParam(":fecha_inicio", $fecha_inicio);
$statement->bindParam(":fecha_fin", $fecha_fin);
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
        <table class="container pt-5" border="4">
            <tr class ="">
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Tipo de Servicio</th>
                <th>Fecha de Servicio</th>
                <th>Patente Asociada</th>
            </tr>
            <?php foreach ($servicios as $servicio) : ?>
                <tr>
                    <td style="width: 300px"><?php echo $servicio['nombre']; ?></td>
                    <td style="width: 200px;"><?php echo $servicio['marca'].''.$servicio['modelo']; ?></td>
                    <td style="width: 250px;"><?php echo $servicio['tipo_servicio']; ?></td>
                    <td style="width: 150px;"><?php echo $servicio['fecha_servicio']; ?></td>
                    <td style="width: 150px;"><?php echo $servicio['patente_asoc']; ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    <?php else : ?>
        <p>No hay servicios realizados hoy.</p>
    <?php endif; ?>
    
</body>
</html>
<?php require "partials/footer.php" ?>
