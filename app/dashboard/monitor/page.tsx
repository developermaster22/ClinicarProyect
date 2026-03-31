import { MonitorRealtimeBridge } from "@/components/monitor-realtime-bridge";
import { formatClp } from "@/lib/format";
import { getDashboardMetrics } from "@/lib/dashboard-metrics";

export default async function MonitorPage() {
  const metrics = await getDashboardMetrics();

  return (
    <main className="page-stack">
      <MonitorRealtimeBridge />

      <section className="hero-card hero-animated">
        <div>
          <p className="eyebrow">Monitor</p>
          <h1>Servicios del dia</h1>
          <p className="muted">Vista operativa para seguir en tiempo real todo lo que se está cargando hoy.</p>
          <div className="hero-pill-row">
            <span className="hero-badge">Seguimiento diario</span>
            <span className="hero-badge">Vista operativa</span>
          </div>
        </div>
        <div className="hero-actions">
          <div className="hero-badge">{metrics.todayLabel}</div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card stat-card-animated">
          <span>Servicios hoy</span>
          <strong>{metrics.todayServicesCount}</strong>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Top del dia</span>
          <strong>{metrics.topService?.name ?? "Sin datos"}</strong>
        </article>
        <article className="stat-card stat-card-animated">
          <span>Mejor cliente</span>
          <strong>{metrics.bestCustomer?.name ?? "Sin datos"}</strong>
        </article>
      </section>

      <section className="panel-card panel-card-animated">
        <h2>Monitor en vivo</h2>
        <div className="monitor-board">
          {metrics.todayServices.length > 0 ? (
            metrics.todayServices.map((service) => (
              <article key={service.id} className="monitor-ticket">
                <div className="monitor-ticket-top">
                  <strong>{service.serviceName}</strong>
                  <span>{new Date(service.receivedAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p>
                  {service.plate} · {service.brand} {service.model}
                </p>
                <p className="muted">
                  {service.customerName} · {service.vehicleType}
                </p>
                <p className="monitor-price">{formatClp(service.price)}</p>
                {service.notes ? <p className="muted">{service.notes}</p> : null}
              </article>
            ))
          ) : (
            <div className="result-card">
              <p className="muted">No hay servicios registrados hoy todavía.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
