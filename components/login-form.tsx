"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { isValidEmail } from "@/lib/validation";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setError("Ingresa un correo valido.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (signInError) {
      setError("No se pudo iniciar sesion. Verifica correo y contrasena.");
      setLoading(false);
      return;
    }

    router.push("/dashboard?alert=login-success");
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-premium">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />

        <div className="auth-layout">
          <div className="auth-story">
            <div className="brand-lockup">
              <Image src="/logo-clinicar.jpeg" alt="Clinicar" width={112} height={112} className="brand-logo" />
              <div>
                <p className="eyebrow">Clinicar</p>
                <h1>Ordenes de trabajo con presencia profesional</h1>
                <p className="muted">
                  Plataforma lista para recibir vehiculos, controlar servicios diarios y mostrarle al cliente una operación más ordenada.
                </p>
              </div>
            </div>

            <div className="auth-highlights">
              <article className="auth-highlight-card">
                <span>Operacion del dia</span>
                <strong>Monitor en vivo</strong>
                <p>Visualiza los servicios cargados durante la jornada en un solo tablero.</p>
              </article>
              <article className="auth-highlight-card">
                <span>Gestion comercial</span>
                <strong>Metricas claras</strong>
                <p>Mejor cliente, tipo mas lavado y facturacion visibles desde el panel.</p>
              </article>
              <article className="auth-highlight-card">
                <span>Ingreso agil</span>
                <strong>Busqueda por patente</strong>
                <p>Recupera datos rápidamente y crea nuevas ordenes con menos fricción.</p>
              </article>
            </div>
          </div>

          <div className="auth-form-panel">
            <div className="auth-form-top">
              <p className="eyebrow">Acceso privado</p>
              <h2>Iniciar sesion</h2>
              <p className="muted">Ingresa para administrar clientes, vehículos, servicios, métricas e informes.</p>
            </div>

            <form className="stack-md" onSubmit={handleSubmit}>
              <label className="field">
                <span>Correo</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@clinicar.cl" required />
              </label>

              <label className="field">
                <span>Contrasena</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingresa tu clave" required />
              </label>

              {error ? <p className="error-text">{error}</p> : null}

              <button className="primary-button primary-button-strong" disabled={loading} type="submit">
                {loading ? "Ingresando..." : "Entrar al dashboard"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
