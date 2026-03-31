export const VEHICLE_TYPES = [
  "City Car",
  "SUV",
  "Sedan",
  "Camioneta",
  "Furgon",
  "Moto",
] as const;

export const OIL_TYPES = ["5W30 Ultra", "5W30", "10W40", "15W40", "20W50"] as const;

export const AUTO_SERVICES = [
  "Lavado completo",
  "Lavado carroceria",
  "Aspirado",
  "Lavado de motor",
  "Lavado de chasis",
  "Pulverizado",
  "Pulido de focos",
  "Cambio de pastillas",
  "Limpieza de tapiz asientos",
  "Limpieza de tapiz alfombra",
  "Limpieza de tapiz techo",
  "Lavado de alfombra",
] as const;

export const MOTO_SERVICES = ["Lavado de motos"] as const;

export const SERVICE_CATALOG = [...AUTO_SERVICES, ...MOTO_SERVICES] as const;

export const INVOICE_TYPES = ["Boleta", "Factura"] as const;

