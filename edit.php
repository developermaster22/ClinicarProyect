<?php

  require "database.php";

  session_start();

  if (!isset($_SESSION["user"])) {
    header("Location: login.php");
    return;
  }

  $patente = $_GET["id"];

  $statement = $conn->prepare("SELECT * FROM vehiculo WHERE patente = :patente LIMIT 1");
  $statement->execute([":patente" => $patente]);

  if ($statement->rowCount() == 0) {
    http_response_code(404);
    echo("HTTP 404 NOT FOUND");
    return;
  }

  $vehiculo = $statement->fetch(PDO::FETCH_ASSOC);

  if ($vehiculo["user_id"] !== $_SESSION["user"]["id"]) {
    http_response_code(403);
    echo("HTTP 403 UNAUTHORIZED");
    return;
  }

  $error = null;

  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["patente"])) {
      $error = "Favor ingresa una patente";
    }else {


      $statement = $conn->prepare("UPDATE vehiculo SET  marca = :marca, modelo = :modelo, year = :year, aceite = :aceite, vol_aceite = :vol_aceite, color = :color, motor = :motor, combustible = :combustible, filtro_aceite = :filtro_aceite, filtro_aire = :filtro_aire WHERE patente = :patente");
      $statement->execute([
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

      $_SESSION["flash"] = ["message" => "Contact {$_POST['name']} updated."];

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
        <div class="card-header">Editar</div>
        <div class="card-body">
          <?php if ($error): ?>
            <p class="text-danger">
              <?= $error ?>
            </p>
          <?php endif ?>
          <form method="POST" action="edit.php?id=<?= $vehiculo['patente']?>">
            <div class="mb-3 row">
                <label for="patente" class="col-md-4 col-form-label text-md-end">Patente</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['patente']?>"id="patente" type="text" class="form-control" name="patente" placeholder = "Ingrese la patente" require autocomplete="rut" autofocus>
                </div>
              </div>
              <div class="mb-3 row">
                <label for="marca" class="col-md-4 col-form-label text-md-end">Marca</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['marca']?>"id="marca" type="text" class="form-control" name="marca" placeholder = "Ingrese la Marca del Vehiculo"  autocomplete="marca" autofocus>
                </div>
              </div>

              <div class="mb-3 row">
              <label for="modelo" class="col-md-4 col-form-label text-md-end">Modelo</label>

              <div class="col-md-6">
                  <input value="<?=$vehiculo['modelo']?>"id="modelo" type="text" class="form-control" name="modelo" placeholder = "Ingrese el Modelo del Vehiculo"  autocomplete="modelo" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="year" class="col-md-4 col-form-label text-md-end">Año</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['year']?>"id="year" type="text" class="form-control" name="year" placeholder = "Ingrese el año del Vehiculo"  autocomplete="year" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="aceite" class="col-md-4 col-form-label text-md-end">Aceite</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['aceite']?>"id="aceite" type="text" class="form-control" name="aceite" placeholder = "Ingrese el nivel de aceite del Vehiculo"  autocomplete="aceite" autofocus>
                </div>
              </div>

              <div class="mb-3 row">
                <label for="vol_aceite" class="col-md-4 col-form-label text-md-end">Volumen de aceite</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['vol_aceite']?>"id="vol_aceite" type="text" class="form-control" name="vol_aceite" placeholder = "Ingrese el Volumen de aceite"  autocomplete="vol_aceite" autofocus>
                </div>
              </div>

              <div class="mb-3 row">
                <label for="color" class="col-md-4 col-form-label text-md-end">Color</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['color']?>"id="color" type="text" class="form-control" name="color" placeholder = "Ingrese el color del Vehiculo"  autocomplete="color" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="motor" class="col-md-4 col-form-label text-md-end">Motor</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['motor']?>"id="motor" type="text" class="form-control" name="motor" placeholder = "Ingrese el motor del Vehiculo"  autocomplete="motor" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="combustible" class="col-md-4 col-form-label text-md-end">Combustible</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['combustible']?>"id="combustible" type="text" class="form-control" name="combustible" placeholder = "Ingrese el combustible del Vehiculo"  autocomplete="combustible" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="filtro_aceite" class="col-md-4 col-form-label text-md-end">Filtro de Aceite</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['filtro_aceite']?>"id="filtro_aceite" type="text" class="form-control" name="filtro_aceite" placeholder = "Ingrese el filtro de aceite del Vehiculo"  autocomplete="filtro_aceite" autofocus>
                </div>
              </div>
              
              <div class="mb-3 row">
                <label for="filtro_aire" class="col-md-4 col-form-label text-md-end">Filtro de aire</label>
  
                <div class="col-md-6">
                  <input value="<?=$vehiculo['filtro_aire']?>"id="filtro_aire" type="text" class="form-control" name="filtro_aire" placeholder = "Ingrese el Filtro de aire del Vehiculo"  autocomplete="filtro_aire" autofocus>
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

