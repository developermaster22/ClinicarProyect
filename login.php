<?php

  require "database.php";

  $error = null;

  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["rut"])) {
      $error = "Tienes que ingresar el RUT del usuario";
    }else {
      $statement = $conn->prepare("SELECT * FROM info_cliente WHERE rut = :rut LIMIT 1");
      $statement->bindParam(":rut", $_POST["rut"]);
      $statement->execute();

      if ($statement->rowCount() == 0) {
        $error = "Invalid credentials.";
      } else {
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
        <div class="card-header">Buscar Cliente</div>
        <div class="card-body">
          <?php if ($error): ?>
            <p class="text-danger">
              <?= $error ?>
            </p>
          <?php endif ?>
          <form method="POST" action="login.php">
            <div class="mb-3 row">
              <label for="rut" class="col-md-4 col-form-label text-md-end">RUT</label>

              <div class="col-md-6">
                <input id="rut" type="rut" class="form-control" name="rut" autocomplete="rut" autofocus>
              </div>
            </div>

            <div class="mb-3 row">
              <label for="nombre" class="col-md-4 col-form-label text-md-end">Nombre</label>

              <div class="col-md-6">
                <input id="nombre" type="nombre" class="form-control" name="nombre" autocomplete="nombre" autofocus>
              </div>
            </div>

            <div class="mb-3 row">
              <div class="col-md-6 offset-md-4">
                <button type="submit" class="btn btn-primary">Buscar</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<?php require "partials/footer.php" ?>

