"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cleanText, formatClp } from "@/lib/format";
import { AUTO_SERVICES, INVOICE_TYPES, MOTO_SERVICES, OIL_TYPES, VEHICLE_TYPES } from "@/lib/constants";
import {
  formatChileanPlate,
  formatMoneyInput,
  isPositiveInteger,
  isValidChileanPlate,
  isValidPhone,
  onlyDigits,
  parseMoneyInput,
  sanitizeDecimalInput,
} from "@/lib/validation";
import type { VehicleLookup, WorkOrderServiceInput } from "@/lib/types";

function buildServices(): WorkOrderServiceInput[] {
  return [
    ...AUTO_SERVICES.map((name) => ({ name, selected: false, price: "", notes: "", category: "auto" as const })),
    ...MOTO_SERVICES.map((name) => ({ name, selected: false, price: "", notes: "", category: "moto" as const })),
  ];
}

function serviceFieldKey(index: number, field: "price" | "notes") {
  return `service-${index}-${field}`;
}

export function WorkOrderForm({
  initialLookup,
  initialPlate,
}: {
  initialLookup: VehicleLookup;
  initialPlate?: string;
}) {
  const router = useRouter();
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [lookupMatches, setLookupMatches] = useState<VehicleLookup["matches"]>(initialLookup.matches ?? []);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [customer, setCustomer] = useState({
    fullName: initialLookup.customer?.full_name ?? "",
    taxId: initialLookup.customer?.tax_id ?? "",
    phone: initialLookup.customer?.phone ?? "",
  });
  const [vehicle, setVehicle] = useState({
    plate: formatChileanPlate(initialLookup.vehicle?.plate ?? initialPlate ?? ""),
    brand: initialLookup.vehicle?.brand ?? "",
    model: initialLookup.vehicle?.model ?? "",
    year: initialLookup.vehicle?.year?.toString() ?? "",
    color: initialLookup.vehicle?.color ?? "",
    engine: initialLookup.vehicle?.engine ?? "",
    mileage: "",
    vehicleType: initialLookup.vehicle?.vehicle_type ?? "",
  });
  const [workOrder, setWorkOrder] = useState({
    receivedAt: new Date().toISOString().slice(0, 16),
    invoiceType: "",
    clientSignature: "",
    notes: "",
    oilType: "",
    oilVolume: "",
    oilFilter: "",
    airFilter: "",
    lubricationPrice: "",
    totalAmount: "",
  });
  const [services, setServices] = useState<WorkOrderServiceInput[]>(buildServices);

  const servicesTotal = services.reduce((acc, service) => acc + (service.selected ? parseMoneyInput(service.price) : 0), 0);
  const lubricationTotal = parseMoneyInput(workOrder.lubricationPrice);
  const suggestedTotal = servicesTotal + lubricationTotal;
  const finalTotal = workOrder.totalAmount ? parseMoneyInput(workOrder.totalAmount) : suggestedTotal;
  const currentYear = new Date().getFullYear();
  const activeServices = services.filter((service) => service.selected).length;
  const lubricationTouched = Boolean(
    workOrder.oilType || workOrder.oilVolume || workOrder.oilFilter || workOrder.airFilter || workOrder.lubricationPrice,
  );

  const errors: Record<string, string> = {};

  if (!cleanText(customer.fullName)) {
    errors.customerFullName = "Ingresa el nombre del cliente.";
  }

  if (!isValidChileanPlate(vehicle.plate)) {
    errors.vehiclePlate = "La patente debe seguir el formato chileno BBBB-12.";
  }

  if (customer.phone && !isValidPhone(customer.phone)) {
    errors.customerPhone = "El telefono debe tener entre 8 y 15 digitos y solo caracteres validos.";
  }

  if (!workOrder.receivedAt) {
    errors.receivedAt = "Selecciona la fecha y hora de la orden.";
  }

  if (vehicle.year) {
    const yearValue = Number(onlyDigits(vehicle.year));

    if (yearValue < 1900 || yearValue > currentYear + 1) {
      errors.vehicleYear = `El ano debe estar entre 1900 y ${currentYear + 1}.`;
    }
  }

  if (vehicle.mileage && !isPositiveInteger(vehicle.mileage)) {
    errors.vehicleMileage = "El kilometraje debe ser un numero mayor a cero.";
  }

  if (workOrder.oilVolume && !/^\d+(\.\d{1,2})?$/.test(workOrder.oilVolume)) {
    errors.oilVolume = "El volumen debe ser numerico, por ejemplo 4.5.";
  }

  if (workOrder.lubricationPrice && !isPositiveInteger(workOrder.lubricationPrice)) {
    errors.lubricationPrice = "El valor de lubricentro debe ser mayor a cero.";
  }

  if (workOrder.totalAmount && !isPositiveInteger(workOrder.totalAmount)) {
    errors.totalAmount = "El total final debe ser mayor a cero.";
  }

  if (lubricationTouched && !workOrder.oilType && !workOrder.lubricationPrice) {
    errors.lubricationGroup = "Si registras lubricentro, indica al menos el tipo de aceite o su valor.";
  }

  services.forEach((service, index) => {
    if (!service.selected) {
      return;
    }

    if (!isPositiveInteger(service.price)) {
      errors[serviceFieldKey(index, "price")] = "Cada servicio seleccionado debe tener un precio valido.";
    }
  });

  if (activeServices === 0 && !lubricationTotal && !finalTotal) {
    errors.services = "Agrega al menos un servicio o un monto de lubricentro para guardar la orden.";
  }

  function markTouched(field: string) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function getFieldError(field: string) {
    if (!submitAttempted && !touched[field]) {
      return null;
    }

    return errors[field] ?? null;
  }

  async function handleLookup() {
    if (!isValidChileanPlate(vehicle.plate)) {
      setLookupMessage("Ingresa una patente chilena valida con formato BBBB-12.");
      markTouched("vehiclePlate");
      return;
    }

    setLoadingLookup(true);
    setLookupMessage(null);
    setLookupMatches([]);

    const response = await fetch(`/api/vehicle-lookup?plate=${encodeURIComponent(vehicle.plate)}`);
    const data = (await response.json()) as VehicleLookup & { error?: string };

    if (!response.ok) {
      setLookupMessage(data.error ?? "No se pudo consultar la patente.");
      setLoadingLookup(false);
      return;
    }

    if (!data.vehicle) {
      setLookupMessage("No hubo coincidencia exacta. Puedes elegir una sugerencia o completar el formulario manualmente.");
      setLookupMatches(data.matches ?? []);
      setLoadingLookup(false);
      return;
    }

    setCustomer({
      fullName: data.customer?.full_name ?? "",
      taxId: data.customer?.tax_id ?? "",
      phone: data.customer?.phone ?? "",
    });
    setVehicle((current) => ({
      ...current,
      plate: formatChileanPlate(data.vehicle?.plate ?? current.plate),
      brand: data.vehicle?.brand ?? "",
      model: data.vehicle?.model ?? "",
      year: data.vehicle?.year?.toString() ?? "",
      color: data.vehicle?.color ?? "",
      engine: data.vehicle?.engine ?? "",
      vehicleType: data.vehicle?.vehicle_type ?? "",
    }));
    setLookupMatches(data.matches ?? []);
    setLookupMessage("Datos recuperados desde la base.");
    setLoadingLookup(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouched((current) => ({
      ...current,
      customerFullName: true,
      customerPhone: true,
      receivedAt: true,
      vehicleMileage: true,
      vehiclePlate: true,
      vehicleYear: true,
      services: true,
      lubricationGroup: true,
      lubricationPrice: true,
      oilVolume: true,
      totalAmount: true,
      ...Object.fromEntries(
        services.flatMap((service, index) => (service.selected ? [[serviceFieldKey(index, "price"), true] as const] : [])),
      ),
    }));

    if (Object.keys(errors).length > 0) {
      setError("Revisa los campos marcados antes de guardar.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fullName: cleanText(customer.fullName),
          taxId: cleanText(customer.taxId),
          phone: customer.phone.trim(),
        },
        vehicle: {
          ...vehicle,
          plate: formatChileanPlate(vehicle.plate),
        },
        workOrder: {
          ...workOrder,
          clientSignature: cleanText(workOrder.clientSignature),
          notes: cleanText(workOrder.notes),
          oilFilter: cleanText(workOrder.oilFilter),
          airFilter: cleanText(workOrder.airFilter),
          totalAmount: formatMoneyInput(String(finalTotal)),
        },
        services,
      }),
    });

    const payload = (await response.json()) as { error?: string; success?: boolean };

    if (!response.ok) {
      setError(payload.error ?? "No se pudo guardar la orden.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push("/dashboard?alert=work-order-saved");
    router.refresh();
  }

  function updateService(index: number, patch: Partial<WorkOrderServiceInput>) {
    setServices((current) => current.map((service, currentIndex) => (currentIndex === index ? { ...service, ...patch } : service)));
  }

  return (
    <form className="page-stack" onSubmit={handleSubmit}>
      <section className="work-order-sheet work-order-sheet-animated work-order-sheet-vivid">
        <div className="sheet-orbit sheet-orbit-one" />
        <div className="sheet-orbit sheet-orbit-two" />
        <div className="sheet-pulse-line" />

        <div className="sheet-header">
          <div className="sheet-title-block">
            <p className="eyebrow">Clinicar</p>
            <h1>Orden de trabajo diaria</h1>
            <p className="muted">
              Flujo digital renovado, sin dependencias del sistema PHP anterior, con validaciones reales y montos listos en CLP.
            </p>
            <div className="insight-strip">
              <div className="insight-card">
                <span>Patente</span>
                <strong>{isValidChileanPlate(vehicle.plate) ? "Valida" : "Pendiente"}</strong>
              </div>
              <div className="insight-card">
                <span>Servicios del dia</span>
                <strong>{activeServices}</strong>
              </div>
              <div className="insight-card">
                <span>Total estimado</span>
                <strong>{formatClp(suggestedTotal)}</strong>
              </div>
            </div>
          </div>

          <div className="lookup-box lookup-box-highlight">
            <label className="field compact">
              <span>Patente chilena</span>
              <input
                value={vehicle.plate}
                onBlur={() => markTouched("vehiclePlate")}
                onChange={(event) => setVehicle({ ...vehicle, plate: formatChileanPlate(event.target.value) })}
                placeholder="BBBB-12"
                required
              />
            </label>
            {getFieldError("vehiclePlate") ? <p className="error-text">{getFieldError("vehiclePlate")}</p> : null}
            <button className="secondary-button" onClick={handleLookup} type="button">
              {loadingLookup ? "Buscando..." : "Traer datos"}
            </button>
            {lookupMessage ? <p className="helper-text">{lookupMessage}</p> : null}
            {lookupMatches && lookupMatches.length > 0 ? (
              <div className="suggestions-list compact">
                {lookupMatches.map((match) => (
                  <button
                    key={match.id}
                    className="suggestion-card suggestion-button"
                    onClick={() => setVehicle({ ...vehicle, plate: formatChileanPlate(match.plate) })}
                    type="button"
                  >
                    <strong>{formatChileanPlate(match.plate)}</strong>
                    <span>
                      {match.brand} {match.model} · {match.vehicle_type ?? "Sin tipo"}
                    </span>
                    <span>{match.customer_name ?? "Sin cliente asociado"}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="form-grid two-columns">
          <label className="field">
            <span>Cliente</span>
            <input
              value={customer.fullName}
              onBlur={() => markTouched("customerFullName")}
              onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
              required
            />
            {getFieldError("customerFullName") ? <p className="error-text">{getFieldError("customerFullName")}</p> : null}
          </label>

          <label className="field">
            <span>Telefono</span>
            <input
              value={customer.phone}
              onBlur={() => markTouched("customerPhone")}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="+56 9 1234 5678"
            />
            {getFieldError("customerPhone") ? <p className="error-text">{getFieldError("customerPhone")}</p> : null}
          </label>

          <label className="field">
            <span>RUT / CI</span>
            <input value={customer.taxId} onChange={(e) => setCustomer({ ...customer, taxId: e.target.value })} />
          </label>

          <label className="field">
            <span>Marca</span>
            <input value={vehicle.brand} onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })} />
          </label>

          <label className="field">
            <span>Color</span>
            <input value={vehicle.color} onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} />
          </label>

          <label className="field">
            <span>Modelo</span>
            <input value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} />
          </label>

          <label className="field">
            <span>Ano</span>
            <input
              inputMode="numeric"
              maxLength={4}
              value={vehicle.year}
              onBlur={() => markTouched("vehicleYear")}
              onChange={(e) => setVehicle({ ...vehicle, year: onlyDigits(e.target.value).slice(0, 4) })}
              placeholder="2026"
            />
            {getFieldError("vehicleYear") ? <p className="error-text">{getFieldError("vehicleYear")}</p> : null}
          </label>

          <label className="field">
            <span>Motor</span>
            <input value={vehicle.engine} onChange={(e) => setVehicle({ ...vehicle, engine: e.target.value })} />
          </label>

          <label className="field">
            <span>Kilometraje</span>
            <input
              inputMode="numeric"
              value={vehicle.mileage}
              onBlur={() => markTouched("vehicleMileage")}
              onChange={(e) => setVehicle({ ...vehicle, mileage: formatMoneyInput(e.target.value) })}
              placeholder="120.000"
            />
            {getFieldError("vehicleMileage") ? <p className="error-text">{getFieldError("vehicleMileage")}</p> : null}
          </label>

          <label className="field">
            <span>Fecha y hora</span>
            <input
              type="datetime-local"
              value={workOrder.receivedAt}
              onBlur={() => markTouched("receivedAt")}
              onChange={(e) => setWorkOrder({ ...workOrder, receivedAt: e.target.value })}
              required
            />
            {getFieldError("receivedAt") ? <p className="error-text">{getFieldError("receivedAt")}</p> : null}
          </label>
        </div>

        <section className="subsection section-shell">
          <div className="section-heading">
            <h2>Tipo de vehiculo</h2>
            <p className="muted">Seleccion unica para identificar la orden del dia.</p>
          </div>
          <div className="check-grid">
            {VEHICLE_TYPES.map((type) => (
              <label key={type} className={vehicle.vehicleType === type ? "check-pill active" : "check-pill"}>
                <input
                  checked={vehicle.vehicleType === type}
                  name="vehicleType"
                  onChange={() => setVehicle({ ...vehicle, vehicleType: type })}
                  type="checkbox"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="subsection section-shell">
          <div className="section-heading">
            <h2>Recepcion del vehiculo</h2>
            <p className="muted">Notas operativas y firma del cliente.</p>
          </div>
          <div className="form-grid two-columns">
            <label className="field">
              <span>Boleta / Factura</span>
              <select value={workOrder.invoiceType} onChange={(e) => setWorkOrder({ ...workOrder, invoiceType: e.target.value })}>
                <option value="">Seleccionar</option>
                {INVOICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Firma cliente</span>
              <input
                value={workOrder.clientSignature}
                onChange={(e) => setWorkOrder({ ...workOrder, clientSignature: e.target.value })}
              />
            </label>

            <label className="field full-width">
              <span>Observaciones</span>
              <textarea value={workOrder.notes} onChange={(e) => setWorkOrder({ ...workOrder, notes: e.target.value })} rows={4} />
            </label>
          </div>
        </section>

        <section className="subsection section-shell">
          <div className="section-heading">
            <h2>Lubricentro</h2>
            <p className="muted">Si completas datos aqui, deben ser coherentes y con valor real.</p>
          </div>
          <div className="form-grid three-columns">
            <label className="field">
              <span>Tipo de aceite</span>
              <select value={workOrder.oilType} onChange={(e) => setWorkOrder({ ...workOrder, oilType: e.target.value })}>
                <option value="">Seleccionar</option>
                {OIL_TYPES.map((oilType) => (
                  <option key={oilType} value={oilType}>
                    {oilType}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Volumen</span>
              <input
                value={workOrder.oilVolume}
                onBlur={() => markTouched("oilVolume")}
                onChange={(e) => setWorkOrder({ ...workOrder, oilVolume: sanitizeDecimalInput(e.target.value, 2) })}
                placeholder="4.5"
              />
              {getFieldError("oilVolume") ? <p className="error-text">{getFieldError("oilVolume")}</p> : null}
            </label>

            <label className="field">
              <span>Valor lubricentro CLP</span>
              <input
                inputMode="numeric"
                value={workOrder.lubricationPrice}
                onBlur={() => markTouched("lubricationPrice")}
                onChange={(e) => setWorkOrder({ ...workOrder, lubricationPrice: formatMoneyInput(e.target.value) })}
                placeholder="25.000"
              />
              {getFieldError("lubricationPrice") ? <p className="error-text">{getFieldError("lubricationPrice")}</p> : null}
            </label>

            <label className="field">
              <span>Filtro aceite</span>
              <input value={workOrder.oilFilter} onChange={(e) => setWorkOrder({ ...workOrder, oilFilter: e.target.value })} />
            </label>

            <label className="field">
              <span>Filtro aire</span>
              <input value={workOrder.airFilter} onChange={(e) => setWorkOrder({ ...workOrder, airFilter: e.target.value })} />
            </label>
          </div>
          {getFieldError("lubricationGroup") ? <p className="error-text">{getFieldError("lubricationGroup")}</p> : null}
        </section>

        <section className="subsection section-shell">
          <div className="section-heading">
            <h2>Servicios de autos</h2>
            <p className="muted">Cada servicio seleccionado se registra dentro de la orden del dia.</p>
          </div>
          <div className="service-table service-table-vivid">
            <div className="service-table-head">
              <span>Servicio</span>
              <span>Seleccion</span>
              <span>Valor CLP</span>
              <span>Observacion</span>
            </div>
            {services
              .filter((service) => service.category === "auto")
              .map((service) => {
                const index = services.findIndex((current) => current.name === service.name);

                return (
                  <div key={service.name} className={service.selected ? "service-row service-row-active" : "service-row"}>
                    <span>{service.name}</span>
                    <label className="checkbox-cell">
                      <input
                        checked={service.selected}
                        onChange={(e) =>
                          updateService(index, e.target.checked ? { selected: true } : { selected: false, price: "", notes: "" })
                        }
                        type="checkbox"
                      />
                    </label>
                    <div>
                      <input
                        inputMode="numeric"
                        value={service.price}
                        onBlur={() => markTouched(serviceFieldKey(index, "price"))}
                        onChange={(e) =>
                          updateService(index, {
                            price: formatMoneyInput(e.target.value),
                            selected: Boolean(onlyDigits(e.target.value)) || service.selected,
                          })
                        }
                        placeholder="0"
                      />
                      {getFieldError(serviceFieldKey(index, "price")) ? (
                        <p className="error-text">{getFieldError(serviceFieldKey(index, "price"))}</p>
                      ) : null}
                    </div>
                    <input
                      value={service.notes}
                      onBlur={() => markTouched(serviceFieldKey(index, "notes"))}
                      onChange={(e) =>
                        updateService(index, {
                          notes: e.target.value,
                          selected: Boolean(cleanText(e.target.value)) || service.selected,
                        })
                      }
                      placeholder="Detalle"
                    />
                  </div>
                );
              })}
          </div>
        </section>

        <section className="subsection section-shell">
          <div className="section-heading">
            <h2>Servicios de motos</h2>
            <p className="muted">Separados para mantener una lectura clara por categoria y por dia.</p>
          </div>
          <div className="service-table service-table-vivid">
            <div className="service-table-head">
              <span>Servicio</span>
              <span>Seleccion</span>
              <span>Valor CLP</span>
              <span>Observacion</span>
            </div>
            {services
              .filter((service) => service.category === "moto")
              .map((service) => {
                const index = services.findIndex((current) => current.name === service.name);

                return (
                  <div key={service.name} className={service.selected ? "service-row service-row-active" : "service-row"}>
                    <span>{service.name}</span>
                    <label className="checkbox-cell">
                      <input
                        checked={service.selected}
                        onChange={(e) =>
                          updateService(index, e.target.checked ? { selected: true } : { selected: false, price: "", notes: "" })
                        }
                        type="checkbox"
                      />
                    </label>
                    <div>
                      <input
                        inputMode="numeric"
                        value={service.price}
                        onBlur={() => markTouched(serviceFieldKey(index, "price"))}
                        onChange={(e) =>
                          updateService(index, {
                            price: formatMoneyInput(e.target.value),
                            selected: Boolean(onlyDigits(e.target.value)) || service.selected,
                          })
                        }
                        placeholder="0"
                      />
                      {getFieldError(serviceFieldKey(index, "price")) ? (
                        <p className="error-text">{getFieldError(serviceFieldKey(index, "price"))}</p>
                      ) : null}
                    </div>
                    <input
                      value={service.notes}
                      onChange={(e) =>
                        updateService(index, {
                          notes: e.target.value,
                          selected: Boolean(cleanText(e.target.value)) || service.selected,
                        })
                      }
                      placeholder="Detalle"
                    />
                  </div>
                );
              })}
          </div>
          {getFieldError("services") ? <p className="error-text">{getFieldError("services")}</p> : null}
        </section>

        <section className="totals-bar totals-bar-strong">
          <div>
            <span className="muted">Total sugerido</span>
            <strong>{formatClp(suggestedTotal)}</strong>
          </div>
          <label className="field compact">
            <span>Total final CLP</span>
            <input
              inputMode="numeric"
              value={workOrder.totalAmount}
              onBlur={() => markTouched("totalAmount")}
              onChange={(e) => setWorkOrder({ ...workOrder, totalAmount: formatMoneyInput(e.target.value) })}
              placeholder={formatMoneyInput(String(suggestedTotal))}
            />
            {getFieldError("totalAmount") ? <p className="error-text">{getFieldError("totalAmount")}</p> : null}
          </label>
        </section>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="action-row">
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Guardando..." : "Guardar orden"}
        </button>
      </div>
    </form>
  );
}
