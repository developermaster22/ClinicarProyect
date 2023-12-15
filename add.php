<?php

  require "database.php";

  session_start();

  if (!isset($_SESSION["user"])) {
    header("Location: login.php");
    return;
  }

  $error = null;

  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["patente"])) {
      $error = "Favor ingresa una patente";
    }else {
      
      $statement = $conn->prepare("INSERT INTO vehiculo (user_id,patente, marca, modelo, year, aceite, vol_aceite, color, motor, combustible, filtro_aceite, filtro_aire) VALUES ({$_SESSION['user']['id']}, :patente, :marca, :modelo, :year, :aceite, :vol_aceite, :color, :motor, :combustible, :filtro_aceite, :filtro_aire)")
      ->execute([
        ":patente"       => $_POST["patente"],
        ":marca"         => $_POST["marca"],
        ":modelo"        => $_POST["modelo"],
        ":year"          => $_POST["year"],
        ":aceite"        => $_POST["aceite"],
        ":vol_aceite"    => $_POST["vol_aceite"],
        ":color"         => $_POST["color"],
        ":motor"         => $_POST["motor"],
        ":combustible"   => $_POST["combustible"],
        ":filtro_aceite" => $_POST["filtro_aceite"],
        ":filtro_aire"   => $_POST["filtro_aire"],
      ]);

      $_SESSION["flash"] = ["message" => "Vehiculo {$_POST['patente']} Agregado!"];

      header("Location: home.php");
      return;
    }
  }
?>

<?php require "partials/header.php" ?>

<div class="container pt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">Agregar Vehiculo</div>
        <div class="card-body">
          <?php if ($error): ?>
            <p class="text-danger">
              <?= $error ?>
            </p>
          <?php endif ?>
          <form method="POST" action="add.php">
            <div class="mb-3 row">
                <label for="patente" class="col-md-4 col-form-label text-md-end">Patente</label>
                <div class="col-md-6">
                  <input id="patente" type="text" class="form-control" name="patente" placeholder = "Ingrese la patente" require autocomplete="rut" autofocus>
                </div>
              </div>
              <div class="mb-3 row">
                <label for="marca" class="col-md-4 col-form-label text-md-end">Marca</label>

                <div class="col-md-6">
                  <input id="marca" type="text" class="form-control" name="marca" placeholder = "Ingrese la Marca del Vehiculo"  autocomplete="marca" autofocus>
                </div>
              </div>

              <div class="mb-3 row">
              <label for="modelo" class="col-md-4 col-form-label text-md-end">Modelo</label>

              <div class="col-md-6">
                  <input id="modelo" type="text" class="form-control" name="modelo" placeholder = "Ingrese el Modelo del Vehiculo"  autocomplete="modelo" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="year" class="col-md-4 col-form-label text-md-end">Año</label>

                <div class="col-md-6">
                  <input id="year" type="text" class="form-control" name="year" placeholder = "Ingrese el año del Vehiculo"  autocomplete="year" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="aceite" class="col-md-4 col-form-label text-md-end">Aceite</label>

                <div class="col-md-6">
                  <input id="aceite" type="text" class="form-control" name="aceite" placeholder = "Ingrese el nivel de aceite del Vehiculo"  autocomplete="aceite" autofocus>
                </div>
              </div>

              <div class="mb-3 row">
                <label for="vol_aceite" class="col-md-4 col-form-label text-md-end">Volumen de aceite</label>

                <div class="col-md-6">
                  <input id="vol_aceite" type="text" class="form-control" name="vol_aceite" placeholder = "Ingrese el Volumen de aceite"  autocomplete="vol_aceite" autofocus>
                </div>
              </div>

              <div class="mb-3 row">
                <label for="color" class="col-md-4 col-form-label text-md-end">Color</label>

                <div class="col-md-6">
                  <input id="color" type="text" class="form-control" name="color" placeholder = "Ingrese el color del Vehiculo"  autocomplete="color" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="motor" class="col-md-4 col-form-label text-md-end">Motor</label>

                <div class="col-md-6">
                  <input id="motor" type="text" class="form-control" name="motor" placeholder = "Ingrese el motor del Vehiculo"  autocomplete="motor" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="combustible" class="col-md-4 col-form-label text-md-end">Combustible</label>

                <div class="col-md-6">
                  <input id="combustible" type="text" class="form-control" name="combustible" placeholder = "Ingrese el combustible del Vehiculo"  autocomplete="combustible" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="filtro_aceite" class="col-md-4 col-form-label text-md-end">Filtro de Aceite</label>

                <div class="col-md-6">
                  <input id="filtro_aceite" type="text" class="form-control" name="filtro_aceite" placeholder = "Ingrese el filtro de aceite del Vehiculo"  autocomplete="filtro_aceite" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="filtro_aire" class="col-md-4 col-form-label text-md-end">Filtro de aire</label>

                <div class="col-md-6">
                  <input id="filtro_aire" type="text" class="form-control" name="filtro_aire" placeholder = "Ingrese el Filtro de aire del Vehiculo"  autocomplete="filtro_aire" autofocus>
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

