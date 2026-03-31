import Link from "next/link";
import { ScreenAlert } from "@/components/screen-alert";
import { formatClp, normalizePlate } from "@/lib/format";
import { getDashboardMetrics } from "@/lib/dashboard-metrics";
import { createClient } from "@/lib/supabase/server";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type DashboardPageProps = {
  searchParams: Promise<{
    alert?: string;
    plate?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { alert, plate } = await searchParams;
  const supabase = await createClient();
  const normalizedSearch = plate ? normalizePlate(plate) : "";
  const metrics = await getDashboardMetrics();
  const dashboardAlert =
    alert === "login-success"
      ? "Inicio de sesion exitoso. Ya puedes gestionar el taller."
      : alert === "work-order-saved"
        ? "Orden guardada correctamente."
        : null;

  let vehicleMatch:
    | {
        plate: string;
        brand: string | null;
        model: string | null;
        vehicle_type: string | null;
        customers: { full_name: string | null; phone: string | null } | null;
      }
    | null = null;

  let vehicleSuggestions: Array<{
    id: string;
    plate: string;
    brand: string | null;
    model: string | null;
    vehicle_type: string | null;
    customers: { full_name: string | null } | null;
  }> = [];

  if (normalizedSearch) {
    const { data } = await supabase
      .from("vehicles")
      .select("plate, brand, model, vehicle_type, customers(full_name, phone)")
      .eq("normalized_plate", normalizedSearch)
      .maybeSingle();

    vehicleMatch = data
      ? {
          plate: data.plate,
          brand: data.brand,
          model: data.model,
          vehicle_type: data.vehicle_type,
          customers: one(data.customers),
        }
      : null;

    const { data: suggestions } = await supabase
      .from("vehicles")
      .select("id, plate, brand, model, vehicle_type, customers(full_name)")
      .ilike("normalized_plate", `%${normalizedSearch}%`)
      .limit(6);

    vehicleSuggestions = (suggestions ?? []).map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      vehicle_type: vehicle.vehicle_type,
      customers: one(vehicle.customers),
    }));
  }

  return (
    <main className="page-stack">
      {dashboardAlert ? <ScreenAlert title="Operacion completada" message={dashboardAlert} /> : null}

      <section className="hero-card hero-animated">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1>Resumen operativo Clinicar</h1>
          <p className="muted">Vista rápida del negocio con foco en cliente destacado, servicios del día y tipo de vehículo más atendido.</p>
          <div className="hero-pill-row">
            <span className="hero-badge">Panel ejecutivo</span>
            <span className="hero-badge">Busqueda rápida</span>
            <span className="hero-badge">Diseño listo para demo</span>
          </div>
        </div>
        <div className="hero-actions">
          <div className="hero-badge">Hoy: {metrics.todayLabel}</div>
          <Link className="primary-button inline-flex" href="/dashboard/work-orders/new">
            Crear orden
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card stat-card-animated">
          <span>Ordenes registradas</span>
          <strong>{metrics.workOrderCount}</strong>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Mejor cliente</span>
          <strong>{metrics.bestCustomer?.name ?? "Sin datos"}</strong>
          <p className="muted">{metrics.bestCustomer ? `${metrics.bestCustomer.orders} ordenes` : "Aun no hay historial suficiente"}</p>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Tipo mas lavado</span>
          <strong>{metrics.mostWashedVehicleType?.type ?? "Sin datos"}</strong>
          <p className="muted">{metrics.mostWashedVehicleType ? `${metrics.mostWashedVehicleType.count} ingresos` : "Aun no hay registros"}</p>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Servicios hoy</span>
          <strong>{metrics.todayServicesCount}</strong>
          <p className="muted">{metrics.topService ? `Top: ${metrics.topService.name}` : "Sin servicios cargados hoy"}</p>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel-card panel-card-animated search-panel">
          <h2>Busqueda por patente</h2>
          <p className="muted">Puedes escribir una patente con o sin guiones para abrir rápido una orden con datos existentes.</p>
          <form className="search-row search-row-strong" action="/dashboard">
            <input defaultValue={plate ?? ""} name="plate" placeholder="Ej: BBBB12 o BBBB-12" />
            <button className="secondary-button" type="submit">
              Buscar
            </button>
          </form>

          {vehicleMatch ? (
            <div className="result-card result-card-strong">
              <p>
                <strong>{vehicleMatch.plate}</strong> · {vehicleMatch.brand} {vehicleMatch.model}
              </p>
              <p className="muted">
                {vehicleMatch.vehicle_type} · {vehicleMatch.customers?.full_name ?? "Sin cliente"} ·{" "}
                {vehicleMatch.customers?.phone ?? "Sin telefono"}
              </p>
              <Link className="text-link" href={`/dashboard/work-orders/new?plate=${encodeURIComponent(vehicleMatch.plate)}`}>
                Abrir orden con datos recuperados
              </Link>
            </div>
          ) : normalizedSearch ? (
            <p className="muted">No hubo coincidencia exacta. Revisa las sugerencias encontradas.</p>
          ) : (
            <p className="muted">Escribe una patente para recuperar rápidamente cliente y vehículo.</p>
          )}

          {vehicleSuggestions.length > 0 ? (
            <div className="suggestions-list">
              {vehicleSuggestions.map((suggestion) => (
                <Link
                  key={suggestion.id}
                  className="suggestion-card"
                  href={`/dashboard/work-orders/new?plate=${encodeURIComponent(suggestion.plate)}`}
                >
                  <strong>{suggestion.plate}</strong>
                  <span>
                    {suggestion.brand} {suggestion.model} · {suggestion.vehicle_type ?? "Sin tipo"}
                  </span>
                  <span>{suggestion.customers?.full_name ?? "Sin cliente asociado"}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </article>

        <article className="panel-card panel-card-animated metric-feature-card">
          <h2>Metricas destacadas</h2>
          <p className="muted">Señales rápidas para conversación comercial y revisión operativa.</p>
          <div className="metric-spotlight-grid">
            <div className="metric-spotlight">
              <span>Facturacion estimada</span>
              <strong>{formatClp(metrics.totalRevenue)}</strong>
            </div>
            <div className="metric-spotlight">
              <span>Cliente mas frecuente</span>
              <strong>{metrics.bestCustomer?.name ?? "Sin datos"}</strong>
            </div>
            <div className="metric-spotlight">
              <span>Tipo dominante</span>
              <strong>{metrics.mostWashedVehicleType?.type ?? "Sin datos"}</strong>
            </div>
          </div>
          <Link className="text-link" href="/dashboard/metrics">
            Ver dashboard de metricas
          </Link>
        </article>

        <article className="panel-card panel-card-animated monitor-preview-card">
          <h2>Monitor del dia</h2>
          <p className="muted">Resumen en vivo de todos los servicios cargados hoy.</p>
          <div className="monitor-mini-list">
            {metrics.todayServices.length > 0 ? (
              metrics.todayServices.slice(0, 4).map((service) => (
                <div key={service.id} className="monitor-mini-item">
                  <strong>{service.serviceName}</strong>
                  <span>
                    {service.plate} · {service.customerName}
                  </span>
                </div>
              ))
            ) : (
              <p className="muted">Todavía no hay servicios registrados hoy.</p>
            )}
          </div>
          <Link className="text-link" href="/dashboard/monitor">
            Abrir monitor
          </Link>
        </article>
      </section>
    </main>
  );
}
