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
   // Validar el formulario de agregar servicio
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // Recoger datos del formulario y validarlos
        $cliente_id = filter_input(INPUT_POST, "id", FILTER_VALIDATE_INT);
        $vehiculo_id = filter_input(INPUT_POST, "modelo", FILTER_VALIDATE_INT);
        $tipo_servicio = filter_input(INPUT_POST, "tipo_servicio", FILTER_SANITIZE_STRING);
        $fecha_servicio = filter_input(INPUT_POST, "fecha_servicio", FILTER_SANITIZE_STRING);
        $patente_asoc = filter_input(INPUT_POST, "patente_asoc", FILTER_SANITIZE_STRING);

        // Mensajes de depuración
        echo "Cliente ID: $cliente_id<br>";
        echo "Vehículo ID: $vehiculo_id<br>";
        echo "Tipo de Servicio: $tipo_servicio<br>";
        echo "Fecha de Servicio: $fecha_servicio<br>";
        echo "Patente Asociada: $patente_asoc<br>";

        // Verificar que los datos son válidos
        if ($cliente_id && $vehiculo_id && $tipo_servicio && $fecha_servicio && $patente_asoc) {
            // Insertar el servicio en la base de datos
            $statement = $conn->prepare("INSERT INTO servicio_info (cliente_id, vehiculo_id, tipo_servicio, fecha_servicio, patente_asoc) VALUES (:cliente_id, :vehiculo_id, :tipo_servicio, :fecha_servicio, :patente_asoc)");

            $statement->bindParam(":cliente_id", $cliente_id);
            $statement->bindParam(":vehiculo_id", $vehiculo_id);
            $statement->bindParam(":tipo_servicio", $tipo_servicio);
            $statement->bindParam(":fecha_servicio", $fecha_servicio);
            $statement->bindParam(":patente_asoc", $patente_asoc);

            $statement->execute();
            $success_message = "Servicio agregado exitosamente.";
        } else {
            $error_message = "Error en los datos del formulario.";
        }
    } catch (PDOException $e) {
        $error_message = "Error al agregar el servicio: " . $e->getMessage();
    }
}


                
        // Verificar que los datos son válidos
        if ($cliente_id && $vehiculo_id && $tipo_servicio && $fecha_servicio && $patente_asoc) {
            // Insertar el servicio en la base de datos
            $statement = $conn->prepare("INSERT INTO servicio_info (cliente_id, vehiculo_id, tipo_servicio, fecha_servicio, patente_asoc) VALUES (:cliente_id, :vehiculo_id, :tipo_servicio, :fecha_servicio, :patente_asoc)");

            $statement->bindParam(":cliente_id", $cliente_id);
            $statement->bindParam(":vehiculo_id", $vehiculo_id);
            $statement->bindParam(":tipo_servicio", $tipo_servicio);
            $statement->bindParam(":fecha_servicio", $fecha_servicio);
            $statement->bindParam(":patente_asoc", $patente_asoc);

            $statement->execute();
            $success_message = "Servicio agregado exitosamente.";
        } else {
            $error_message = "Error en los datos del formulario.";
        }
    } catch (PDOException $e) {
        $error_message = "Error al agregar el servicio: " . $e->getMessage();
    }
}

// Obtener la lista de clientes y vehículos
$clientes = $conn->query("SELECT * FROM info_cliente")->fetchAll(PDO::FETCH_ASSOC);
$vehiculos = $conn->query("SELECT * FROM vehiculo")->fetchAll(PDO::FETCH_ASSOC);
$servicio_info= $conn->query("SELECT * FROM servicio_info ")->fetchAll(PDO::FETCH_ASSOC)
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
</body>
</html>

<?php require "partials/footer.php" ?>
