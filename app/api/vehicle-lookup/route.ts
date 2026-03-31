import { NextResponse } from "next/server";
import { normalizePlate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plate = searchParams.get("plate")?.trim() ?? "";
  const normalizedPlate = normalizePlate(plate);

  if (!normalizedPlate) {
    return NextResponse.json({ customer: null, vehicle: null, matches: [] }, { status: 200 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, plate, brand, model, year, color, engine, vehicle_type, customer_id, customers(id, full_name, tax_id, phone)")
    .eq("normalized_plate", normalizedPlate)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: matches } = await supabase
    .from("vehicles")
    .select("id, plate, brand, model, vehicle_type, customers(full_name)")
    .ilike("normalized_plate", `%${normalizedPlate}%`)
    .limit(5);

  return NextResponse.json({
    customer: Array.isArray(data?.customers) ? data?.customers[0] ?? null : data?.customers ?? null,
    vehicle: data
      ? {
          id: data.id,
          plate: data.plate,
          brand: data.brand,
          model: data.model,
          year: data.year,
          color: data.color,
          engine: data.engine,
          vehicle_type: data.vehicle_type,
        }
      : null,
    matches: (matches ?? []).map((match) => {
      const customer = Array.isArray(match.customers)
        ? (match.customers[0] as { full_name?: string } | undefined)
        : (match.customers as { full_name?: string } | null);

      return {
        id: match.id,
        plate: match.plate,
        brand: match.brand,
        model: match.model,
        vehicle_type: match.vehicle_type,
        customer_name: customer?.full_name ?? null,
      };
    }),
  });
}
