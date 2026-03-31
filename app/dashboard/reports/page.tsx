import { ScreenAlert } from "@/components/screen-alert";
import { SERVICE_CATALOG, VEHICLE_TYPES } from "@/lib/constants";
import { formatClp } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type ReportsPageProps = {
  searchParams: Promise<{
    service?: string;
    vehicleType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const filters = await searchParams;
  const supabase = await createClient();
  const reportAlert = filters.service || filters.vehicleType || filters.dateFrom || filters.dateTo;

  let query = supabase
    .from("work_order_services")
    .select(
      "id, service_name, category, price, notes, work_orders(id, received_at, total_amount, vehicles(plate, brand, model, vehicle_type), customers(full_name, phone))",
    )
    .order("created_at", { ascending: false });

  if (filters.service) {
    query = query.eq("service_name", filters.service);
  }

  const { data } = await query;

  const rows = (data ?? []).filter((row) => {
    const workOrder = one(row.work_orders);
    const vehicle = one(workOrder?.vehicles);
    const vehicleType = vehicle?.vehicle_type;
    const receivedAt = workOrder?.received_at ? new Date(workOrder.received_at) : null;
    const fromDate = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
    const toDate = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;
    const matchesVehicleType = filters.vehicleType ? vehicleType === filters.vehicleType : true;
    const matchesFrom = fromDate && receivedAt ? receivedAt >= fromDate : true;
    const matchesTo = toDate && receivedAt ? receivedAt <= toDate : true;

    return matchesVehicleType && matchesFrom && matchesTo;
  });

  rows.sort((left, right) => {
    const leftDate = one(left.work_orders)?.received_at ?? "";
    const rightDate = one(right.work_orders)?.received_at ?? "";
    return rightDate.localeCompare(leftDate);
  });

  return (
    <main className="page-stack">
      {reportAlert ? (
        <ScreenAlert
          title="Informe actualizado"
          message="Los resultados fueron filtrados correctamente segun los parametros seleccionados."
        />
      ) : null}

      <section className="hero-card hero-animated">
        <div>
          <p className="eyebrow">Informes</p>
          <h1>Reporte diario por servicio y parametros</h1>
          <p className="muted">Los servicios y ordenes se filtran por la fecha real de recepcion del trabajo.</p>
          <div className="hero-pill-row">
            <span className="hero-badge">Filtros diarios</span>
            <span className="hero-badge">Reporte comercial</span>
          </div>
        </div>
      </section>

      <section className="panel-card panel-card-animated">
        <form className="filter-grid" action="/dashboard/reports">
          <label className="field">
            <span>Servicio</span>
            <select defaultValue={filters.service ?? ""} name="service">
              <option value="">Todos</option>
              {SERVICE_CATALOG.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Tipo de vehiculo</span>
            <select defaultValue={filters.vehicleType ?? ""} name="vehicleType">
              <option value="">Todos</option>
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Desde</span>
            <input defaultValue={filters.dateFrom ?? ""} name="dateFrom" type="date" />
          </label>

          <label className="field">
            <span>Hasta</span>
            <input defaultValue={filters.dateTo ?? ""} name="dateTo" type="date" />
          </label>

          <button className="primary-button align-end" type="submit">
            Filtrar
          </button>
        </form>
      </section>

      <section className="panel-card panel-card-animated">
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vehiculo</th>
                <th>Tipo</th>
                <th>Servicio</th>
                <th>Valor CLP</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row) => {
                  const workOrder = one(row.work_orders);
                  const customer = one(workOrder?.customers);
                  const vehicle = one(workOrder?.vehicles);

                  return (
                    <tr key={row.id}>
                      <td>{new Date(workOrder?.received_at ?? new Date().toISOString()).toLocaleString("es-CL")}</td>
                      <td>{customer?.full_name ?? "-"}</td>
                      <td>
                        {vehicle?.plate ?? "-"} · {vehicle?.brand ?? ""} {vehicle?.model ?? ""}
                      </td>
                      <td>{vehicle?.vehicle_type ?? "-"}</td>
                      <td>{row.service_name}</td>
                      <td>{row.price ? formatClp(Number(row.price)) : "-"}</td>
                      <td>{row.notes ?? "-"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>No hay resultados con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
