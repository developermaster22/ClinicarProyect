import { WorkOrderForm } from "@/components/work-order-form";
import { normalizePlate } from "@/lib/format";
import type { VehicleLookup } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type WorkOrderPageProps = {
  searchParams: Promise<{
    plate?: string;
  }>;
};

export default async function NewWorkOrderPage({ searchParams }: WorkOrderPageProps) {
  const { plate } = await searchParams;
  const supabase = await createClient();

  let initialLookup: VehicleLookup = { customer: null, vehicle: null };

  if (plate) {
    const { data } = await supabase
      .from("vehicles")
      .select("id, plate, brand, model, year, color, engine, vehicle_type, customers(id, full_name, tax_id, phone)")
      .eq("normalized_plate", normalizePlate(plate))
      .maybeSingle();

    if (data) {
      initialLookup = {
        customer: one(data.customers),
        vehicle: {
          id: data.id,
          plate: data.plate,
          brand: data.brand,
          model: data.model,
          year: data.year,
          color: data.color,
          engine: data.engine,
          vehicle_type: data.vehicle_type,
        },
      };
    }
  }

  return <WorkOrderForm initialLookup={initialLookup} initialPlate={plate} />;
}
