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

$contact = $statement->fetch(PDO::FETCH_ASSOC);

if ($contact["user_id"] !== $_SESSION["user"]["id"]) {
  http_response_code(403);
  echo("HTTP 403 UNAUTHORIZED");
  return;
}

$conn->prepare("DELETE FROM vehiculo WHERE patente = :patente")->execute([":patente" => $patente]);

$_SESSION["flash"] = ["message" => "Contact {$contact['name']} deleted."];

header("Location: home.php");
