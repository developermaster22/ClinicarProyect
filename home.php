<?php

require "database.php";

session_start();

if (!isset($_SESSION["user"])) {
  header("Location: login.php");
  return;
}

$vehiculos = $conn->query("SELECT * FROM vehiculo WHERE user_id = {$_SESSION['user']['id']}");

?>

<?php require "partials/header.php" ?>

<div class="container pt-4 p-3">
  <div class="row">
    
    <?php if ($vehiculos->rowCount() == 0): ?>
      <div class="col-md-4 mx-auto">
        <div class="card card-body text-center">
          <p>Este cliente no tiene vehiculos asociados aún</p>
          <a href="add.php">Agrega uno!</a>
        </div>
      </div>
    <?php endif ?>
    <?php foreach ($vehiculos as $vehiculo): ?>
      <div class="col-md-4 mb-3">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="card-title text-capitalize"><?= $vehiculo["patente"] ?></h3>
            <p class="m-2"><?= $vehiculo["marca"] ?></p>
            <a href="edit.php?id=<?= $vehiculo["patente"] ?>" class="btn btn-secondary mb-2">Editar Vehiculo</a>
            <a href="delete.php?id=<?= $vehiculo["patente"] ?>" class="btn btn-danger mb-2">Eliminar</a>
          </div>
        </div>
      </div>
    <?php endforeach ?>

  </div>
</div>

<?php require "partials/footer.php" ?>
