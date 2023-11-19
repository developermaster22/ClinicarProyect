-- Active: 1665162857560@@localhost@3306

CREATE DATABASE IF NOT EXISTS `clinicar` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `clinicar`;


SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `agendamiento`;
CREATE TABLE IF NOT EXISTS `agendamiento` (
  `patente_auto` varchar(10) NOT NULL,
  `patente_agen` varchar(20) DEFAULT NULL,
  `hora_agen` datetime DEFAULT NULL,
  `tipo_servicio` char(25) DEFAULT NULL,
  PRIMARY KEY (`patente_auto`)
);



INSERT INTO `agendamiento` (`patente_auto`, `patente_agen`, `hora_agen`, `tipo_servicio`) VALUES
('G4-SD-41', NULL, '2022-10-15 16:30:00', 'Lavado Completo');



DROP TABLE IF EXISTS `info_cliente`;
CREATE TABLE `info_cliente` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `rut` varchar(20) NOT NULL,
  `nombre` char(20) DEFAULT NULL,
  `telefono` varchar(12) DEFAULT NULL
);


INSERT INTO `info_cliente` (`rut`, `nombre`, `telefono`) VALUES
('21190811-4', 'IVANA INFANTE', 931083927);


DROP TABLE IF EXISTS `info_empleado`;
CREATE TABLE IF NOT EXISTS `info_empleado` (
  `cod_empleado` int(11) NOT NULL,
  `nombre` char(10) DEFAULT NULL,
  `apellido` char(10) DEFAULT NULL,
  PRIMARY KEY (`cod_empleado`)
);

INSERT INTO `info_empleado` (`cod_empleado`, `nombre`, `apellido`) VALUES
(1, 'Brandon', 'Lopez');


DROP TABLE IF EXISTS `servicio_info`;
CREATE TABLE IF NOT EXISTS `servicio_info` (
  `n_servicio` int(11) NOT NULL,
  `tipo_servicio` varchar(30) DEFAULT NULL,
  `auto_asoc` varchar(30) DEFAULT NULL,
  `patente_asoc` varchar(20) DEFAULT NULL,
  `empleado_asoc` varchar(20) DEFAULT NULL,
  `fecha_servicio` datetime DEFAULT NULL,
  PRIMARY KEY (`n_servicio`),
  KEY `patente_asoc` (`patente_asoc`),
  KEY `tipo_servicio` (`tipo_servicio`)
);

INSERT INTO `servicio_info` (`n_servicio`, `tipo_servicio`, `auto_asoc`, `patente_asoc`, `empleado_asoc`, `fecha_servicio`) VALUES
(1, 'Lavado Completo', NULL, 'G4-5D-41', 'BRANDO LOPEZ', '2022-10-08 00:00:00');


DROP TABLE IF EXISTS `vehiculo`;
CREATE TABLE IF NOT EXISTS `vehiculo` (
  user_id INT NOT NULL,
  `patente` varchar(10) NOT NULL,
  `marca` varchar(15) DEFAULT NULL,
  `modelo` varchar(15) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `aceite` varchar(15) DEFAULT NULL,
  `vol_aceite` varchar(6) DEFAULT NULL,
  `color` char(10) DEFAULT NULL,
  `motor` varchar(5) DEFAULT NULL,
  `combustible` char(10) DEFAULT NULL,
  `filtro_aceite` varchar(12) DEFAULT NULL,
  `filtro_aire` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`patente`),
  FOREIGN KEY (user_id) REFERENCES info_cliente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    user_id INT NOT NULL,
    phone_number VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO `vehiculo` (user_id,`patente`, `year`, `aceite`, `vol_aceite`, `color`, `modelo`, `motor`, `combustible`, `marca`, `filtro_aceite`, `filtro_aire`) VALUES
(1,'G4-SD-41', 2017, NULL, NULL, 'GRIS', 'COROLLA', '3,0', 'BENCINA', 'TOYOTA', NULL, NULL);

CREATE TABLE user_admin (
id  INT AUTO_INCREMENT PRIMARY KEY,
usuario VARCHAR(45),
contraseña VARCHAR(45)
);



