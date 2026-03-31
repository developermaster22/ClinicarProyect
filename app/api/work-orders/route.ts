import { NextResponse } from "next/server";
import { cleanText, normalizePlate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { formatChileanPlate, isPositiveInteger, isValidChileanPlate, isValidPhone, parseMoneyInput } from "@/lib/validation";

type RequestPayload = {
  customer: {
    fullName: string;
    taxId: string;
    phone: string;
  };
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    year: string;
    color: string;
    engine: string;
    mileage: string;
    vehicleType: string;
  };
  workOrder: {
    receivedAt: string;
    invoiceType: string;
    clientSignature: string;
    notes: string;
    oilType: string;
    oilVolume: string;
    oilFilter: string;
    airFilter: string;
    lubricationPrice: string;
    totalAmount: string;
  };
  services: Array<{
    name: string;
    selected: boolean;
    price: string;
    notes: string;
    category: "auto" | "moto";
  }>;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as RequestPayload;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const normalizedPlate = normalizePlate(payload.vehicle.plate);
  const normalizedTaxId = cleanText(payload.customer.taxId);
  const cleanedFullName = cleanText(payload.customer.fullName);
  const cleanedPhone = payload.customer.phone.trim();
  const cleanedPlate = formatChileanPlate(payload.vehicle.plate);
  const currentYear = new Date().getFullYear();
  const selectedServices = payload.services.filter((service) => service.selected);
  const lubricationPrice = payload.workOrder.lubricationPrice ? parseMoneyInput(payload.workOrder.lubricationPrice) : 0;
  const totalAmount = payload.workOrder.totalAmount ? parseMoneyInput(payload.workOrder.totalAmount) : 0;

  if (!cleanedFullName) {
    return NextResponse.json({ error: "El nombre del cliente es obligatorio." }, { status: 400 });
  }

  if (!isValidChileanPlate(cleanedPlate)) {
    return NextResponse.json({ error: "La patente debe cumplir el formato chileno BBBB-12." }, { status: 400 });
  }

  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return NextResponse.json({ error: "El telefono ingresado no es valido." }, { status: 400 });
  }

  if (!payload.workOrder.receivedAt) {
    return NextResponse.json({ error: "La fecha de la orden es obligatoria." }, { status: 400 });
  }

  if (payload.vehicle.year) {
    const year = Number(payload.vehicle.year);

    if (!Number.isInteger(year) || year < 1900 || year > currentYear + 1) {
      return NextResponse.json({ error: "El ano del vehiculo no es valido." }, { status: 400 });
    }
  }

  if (payload.vehicle.mileage && !isPositiveInteger(payload.vehicle.mileage)) {
    return NextResponse.json({ error: "El kilometraje debe ser mayor a cero." }, { status: 400 });
  }

  if (payload.workOrder.oilVolume && !/^\d+(\.\d{1,2})?$/.test(payload.workOrder.oilVolume)) {
    return NextResponse.json({ error: "El volumen de aceite no es valido." }, { status: 400 });
  }

  if (payload.workOrder.lubricationPrice && !isPositiveInteger(payload.workOrder.lubricationPrice)) {
    return NextResponse.json({ error: "El valor de lubricentro debe ser mayor a cero." }, { status: 400 });
  }

  if (payload.workOrder.totalAmount && !isPositiveInteger(payload.workOrder.totalAmount)) {
    return NextResponse.json({ error: "El total final debe ser mayor a cero." }, { status: 400 });
  }

  if (
    (payload.workOrder.oilType ||
      payload.workOrder.oilVolume ||
      payload.workOrder.oilFilter.trim() ||
      payload.workOrder.airFilter.trim() ||
      payload.workOrder.lubricationPrice) &&
    !payload.workOrder.oilType &&
    !payload.workOrder.lubricationPrice
  ) {
    return NextResponse.json({ error: "Si registras lubricentro, indica al menos el tipo de aceite o su valor." }, { status: 400 });
  }

  for (const service of selectedServices) {
    if (!isPositiveInteger(service.price)) {
      return NextResponse.json({ error: `El servicio ${service.name} debe tener un precio valido.` }, { status: 400 });
    }
  }

  if (selectedServices.length === 0 && !lubricationPrice && !totalAmount) {
    return NextResponse.json({ error: "Debes registrar al menos un servicio o un monto de lubricentro." }, { status: 400 });
  }

  const { data: existingCustomer } = normalizedTaxId
    ? await supabase.from("customers").select("id").eq("tax_id", normalizedTaxId).maybeSingle()
    : { data: null };

  let customerId = existingCustomer?.id ?? null;

  if (!customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        full_name: cleanedFullName,
        tax_id: normalizedTaxId || null,
        phone: cleanedPhone || null,
      })
      .select("id")
      .single();

    if (customerError) {
      return NextResponse.json({ error: customerError.message }, { status: 400 });
    }

    customerId = customer.id;
  } else {
    const { error: customerUpdateError } = await supabase
      .from("customers")
      .update({
        full_name: cleanedFullName,
        phone: cleanedPhone || null,
      })
      .eq("id", customerId);

    if (customerUpdateError) {
      return NextResponse.json({ error: customerUpdateError.message }, { status: 400 });
    }
  }

  const vehicleRecord = {
    customer_id: customerId,
    plate: cleanedPlate,
    normalized_plate: normalizedPlate,
    brand: cleanText(payload.vehicle.brand) || null,
    model: cleanText(payload.vehicle.model) || null,
    year: payload.vehicle.year ? Number(payload.vehicle.year) : null,
    color: cleanText(payload.vehicle.color) || null,
    engine: cleanText(payload.vehicle.engine) || null,
    mileage: payload.vehicle.mileage ? parseMoneyInput(payload.vehicle.mileage) : null,
    vehicle_type: payload.vehicle.vehicleType || null,
  };

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .upsert(vehicleRecord, { onConflict: "normalized_plate" })
    .select("id")
    .single();

  if (vehicleError) {
    return NextResponse.json({ error: vehicleError.message }, { status: 400 });
  }
  const { data: workOrder, error: workOrderError } = await supabase
    .from("work_orders")
    .insert({
      customer_id: customerId,
      vehicle_id: vehicle.id,
      created_by: user.id,
      received_at: payload.workOrder.receivedAt,
      invoice_type: payload.workOrder.invoiceType || null,
      client_signature_name: cleanText(payload.workOrder.clientSignature) || null,
      reception_notes: cleanText(payload.workOrder.notes) || null,
      oil_type: payload.workOrder.oilType || null,
      oil_volume: payload.workOrder.oilVolume.trim() || null,
      oil_filter: cleanText(payload.workOrder.oilFilter) || null,
      air_filter: cleanText(payload.workOrder.airFilter) || null,
      lubrication_price: lubricationPrice || null,
      total_amount: totalAmount || null,
    })
    .select("id")
    .single();

  if (workOrderError) {
    return NextResponse.json({ error: workOrderError.message }, { status: 400 });
  }

  if (selectedServices.length > 0) {
    const { error: servicesError } = await supabase.from("work_order_services").insert(
      selectedServices.map((service) => ({
        work_order_id: workOrder.id,
        service_name: service.name,
        category: service.category,
        price: parseMoneyInput(service.price) || null,
        notes: cleanText(service.notes) || null,
      })),
    );

    if (servicesError) {
      return NextResponse.json({ error: servicesError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true, id: workOrder.id });
}
