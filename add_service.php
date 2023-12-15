<?php
require "partials/header.php";

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "1234Cesar";
$dbname = "clinicar";

// Conexión a la base de datos
try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}

// Iniciar sesión
session_start();

// Validar el formulario de agregar servicio
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // Recoger datos del formulario y validarlos
        $cliente_id = filter_input(INPUT_POST, "cliente_asoc", FILTER_VALIDATE_INT);
        $vehiculo_id = filter_input(INPUT_POST, "auto_asoc", FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $tipo_servicio = filter_input(INPUT_POST, "tipo_servicio", FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $fecha_servicio = filter_input(INPUT_POST, "fecha_servicio", FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $patente_asoc = filter_input(INPUT_POST, "patente_asoc", FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    
        // Insertar datos en la tabla servicio_info
        $stmt = $conn->prepare("INSERT INTO servicio_info (n_servicio,cliente_asoc, auto_asoc, tipo_servicio, fecha_servicio, patente_asoc) VALUES (:n_servicio,:cliente_asoc, :auto_asoc, :tipo_servicio, :fecha_servicio, :patente_asoc)");
        $stmt->bindParam(':n_servicio', $n_servicio, PDO::PARAM_INT);
        $stmt->bindParam(':cliente_asoc', $cliente_id, PDO::PARAM_INT);
        $stmt->bindParam(':auto_asoc', $vehiculo_id, PDO::PARAM_STR);
        $stmt->bindParam(':tipo_servicio', $tipo_servicio, PDO::PARAM_STR);
        $stmt->bindParam(':fecha_servicio', $fecha_servicio, PDO::PARAM_STR);
        $stmt->bindParam(':patente_asoc', $patente_asoc, PDO::PARAM_STR);
        $stmt->execute();

        $success_message = "Servicio agregado con éxito";
    } catch (PDOException $e) {
        $error_message = "Error al agregar el servicio: " . $e->getMessage();
    }
}

// Obtener la lista de clientes y vehículos
$clientes = $conn->query("SELECT * FROM info_cliente")->fetchAll(PDO::FETCH_ASSOC);
$vehiculos = $conn->query("SELECT * FROM vehiculo")->fetchAll(PDO::FETCH_ASSOC);
$servicio_info = $conn->query("SELECT * FROM servicio_info")->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar Servicio</title>
</head>

<body>
    <div class="container pt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <h2 class="card-header">Agregar Servicio</h2>
                    <div class="card-body">

                        <?php if (isset($error_message)) : ?>
                            <p style="color: red;"><?php echo $error_message; ?></p>
                        <?php endif; ?>

                        <?php if (isset($success_message)) : ?>
                            <p style="color: green;"><?php echo $success_message; ?></p>
                        <?php endif; ?>

                        <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post">
                            <label for="cliente">Cliente</label>
                            <select name="cliente_id" id="cliente_id" required>
                                <?php foreach ($clientes as $cliente) : ?>
                                    <option value="<?php echo $cliente['id']; ?>"><?php echo $cliente['nombre']; ?></option>
                                <?php endforeach; ?>
                            </select>
                            <br>

                            <label for="vehiculo_id">Vehículo:</label>
                            <select name="vehiculo_id" id="vehiculo_id" required>
                                <?php foreach ($vehiculos as $vehiculo) : ?>
                                    <option value="<?php echo $vehiculo['marca'] . ' ' . $vehiculo['modelo']; ?>">
                                        <?php echo $vehiculo['marca'] . ' ' . $vehiculo['modelo']; ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>

                            <label for="tipo_servicio">Tipo de Servicio:</label>
                            <select name="tipo_servicio" id="tipo_servicio" required>
                                <?php foreach ($servicio_info as $servicio) : ?>
                                    <option value="<?php echo $servicio['tipo_servicio']; ?>"><?php echo $servicio['tipo_servicio']; ?></option>
                                <?php endforeach; ?>
                            </select>
                            <br>

                            <label for="fecha_servicio">Fecha de Servicio:</label>
                            <input type="date" name="fecha_servicio" id="fecha_servicio" required>
                            <br>

                            <label for="patente_asoc">Patente Asociada:</label>
                            <select name="patente_asoc" id="patente_asoc" required>
                                <?php foreach ($vehiculos as $vehiculo) : ?>
                                    <option value="<?php echo $vehiculo['patente']; ?>"><?php echo $vehiculo['patente']; ?></option>
                                <?php endforeach; ?>
                            </select>
                            <br>

                            <input type="submit" value="Agregar Servicio">
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

<?php require "partials/footer.php" ?>

</html>
