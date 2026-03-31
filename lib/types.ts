import type { AUTO_SERVICES, INVOICE_TYPES, MOTO_SERVICES, OIL_TYPES, VEHICLE_TYPES } from "./constants";

export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type OilType = (typeof OIL_TYPES)[number];
export type InvoiceType = (typeof INVOICE_TYPES)[number];
export type ServiceName = (typeof AUTO_SERVICES)[number] | (typeof MOTO_SERVICES)[number];

export type VehicleLookup = {
  customer: {
    id: string;
    full_name: string;
    tax_id: string | null;
    phone: string | null;
  } | null;
  vehicle: {
    id: string;
    plate: string;
    brand: string | null;
    model: string | null;
    year: number | null;
    color: string | null;
    engine: string | null;
    vehicle_type: VehicleType | null;
  } | null;
  matches?: Array<{
    id: string;
    plate: string;
    brand: string | null;
    model: string | null;
    vehicle_type: VehicleType | null;
    customer_name: string | null;
  }>;
};

export type WorkOrderServiceInput = {
  name: ServiceName;
  selected: boolean;
  price: string;
  notes: string;
  category: "auto" | "moto";
};
