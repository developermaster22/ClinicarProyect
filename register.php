<?php

  require "database.php";

  $error = null;

  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["rut"]) || empty($_POST["nombre"]) || empty($_POST["telefono"])) {
      $error = "Favor Ingresa todos los datos";
    }else {
      $statement = $conn->prepare("SELECT * FROM info_cliente WHERE rut = :rut");
      $statement->bindParam(":rut", $_POST["rut"]);
      $statement->execute();

      if ($statement->rowCount() > 0) {
        $error = "Este RUT ya está registrado!";
      } else {
        $conn
          ->prepare("INSERT INTO info_cliente (rut, nombre, telefono) VALUES (:rut, :nombre, :telefono)")
          ->execute([
            ":rut" => $_POST["rut"],
            ":nombre" => $_POST["nombre"],
            ":telefono" => $_POST["telefono"],
          ]);

          $statement = $conn->prepare("SELECT * FROM info_cliente WHERE rut = :rut LIMIT 1");
          $statement->bindParam(":rut", $_POST["rut"]);
          $statement->execute();
          $user = $statement->fetch(PDO::FETCH_ASSOC);

          session_start();
          $_SESSION["user"] = $user;

          header("Location: home.php");
      }
    }
  }
?>

<?php require "partials/header.php" ?>

<div class="container pt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">Agregar Usuario</div>
        <div class="card-body">
          <?php if ($error): ?>
            <p class="text-danger">
              <?= $error ?>
            </p>
          <?php endif ?>
          <form method="POST" action="register.php">
            <div class="mb-3 row">
              <label for="rut" class="col-md-4 col-form-label text-md-end">Rut</label>

              <div class="col-md-6">
                <input id="rut" type="text" class="form-control" name="rut" autocomplete="rut" autofocus>
              </div>
            </div>

            <div class="mb-3 row">
              <label for="nombre" class="col-md-4 col-form-label text-md-end">Nombre</label>

              <div class="col-md-6">
                <input id="nombre" type="text" class="form-control" name="nombre" autocomplete="nombre" autofocus>
              </div>
            </div>
            
            <div class="mb-3 row">
              <label for="telefono" class="col-md-4 col-form-label text-md-end">Telefono</label>

              <div class="col-md-6">
                <input id="telefono" type="text" class="form-control" name="telefono" autocomplete="telefono" autofocus>
              </div>
            </div>

            <div class="mb-3 row">
              <div class="col-md-6 offset-md-4">
                <button type="submit" class="btn btn-primary">Guardar</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require "partials/footer.php" ?>

