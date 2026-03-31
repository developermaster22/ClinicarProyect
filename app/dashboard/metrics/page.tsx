import { formatClp } from "@/lib/format";
import { getDashboardMetrics } from "@/lib/dashboard-metrics";

export default async function MetricsPage() {
  const metrics = await getDashboardMetrics();

  return (
    <main className="page-stack">
      <section className="hero-card hero-animated">
        <div>
          <p className="eyebrow">Metricas</p>
          <h1>Dashboard de metricas</h1>
          <p className="muted">Lectura rápida del rendimiento comercial y operativo de la jornada.</p>
          <div className="hero-pill-row">
            <span className="hero-badge">Cliente destacado</span>
            <span className="hero-badge">Facturacion</span>
            <span className="hero-badge">Parque atendido</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card stat-card-animated">
          <span>Mejor cliente</span>
          <strong>{metrics.bestCustomer?.name ?? "Sin datos"}</strong>
          <p className="muted">{metrics.bestCustomer ? `${metrics.bestCustomer.orders} ordenes acumuladas` : "Sin registros"}</p>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Tipo mas lavado</span>
          <strong>{metrics.mostWashedVehicleType?.type ?? "Sin datos"}</strong>
          <p className="muted">{metrics.mostWashedVehicleType ? `${metrics.mostWashedVehicleType.count} ingresos` : "Sin registros"}</p>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Servicio mas solicitado</span>
          <strong>{metrics.topService?.name ?? "Sin datos"}</strong>
          <p className="muted">{metrics.topService ? `${metrics.topService.count} registros` : "Sin registros"}</p>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Facturacion acumulada</span>
          <strong>{formatClp(metrics.totalRevenue)}</strong>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel-card panel-card-animated metric-feature-card">
          <h2>Cliente destacado</h2>
          <div className="metric-spotlight-grid">
            <div className="metric-spotlight">
              <span>Nombre</span>
              <strong>{metrics.bestCustomer?.name ?? "Sin datos"}</strong>
            </div>
            <div className="metric-spotlight">
              <span>Ordenes</span>
              <strong>{metrics.bestCustomer?.orders ?? 0}</strong>
            </div>
            <div className="metric-spotlight">
              <span>Total estimado</span>
              <strong>{formatClp(metrics.bestCustomer?.total ?? 0)}</strong>
            </div>
          </div>
        </article>

        <article className="panel-card panel-card-animated metric-feature-card">
          <h2>Panorama del parque atendido</h2>
          <div className="metric-spotlight-grid">
            <div className="metric-spotlight">
              <span>Tipo lider</span>
              <strong>{metrics.mostWashedVehicleType?.type ?? "Sin datos"}</strong>
            </div>
            <div className="metric-spotlight">
              <span>Servicios de hoy</span>
              <strong>{metrics.todayServicesCount}</strong>
            </div>
            <div className="metric-spotlight">
              <span>Clientes historicos</span>
              <strong>{metrics.customerCount}</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
