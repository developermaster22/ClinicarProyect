"use client";

import { useEffect, useState } from "react";

export function ScreenAlert({
  title,
  message,
  tone = "success",
}: {
  title: string;
  message: string;
  tone?: "success" | "error";
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={tone === "success" ? "screen-alert screen-alert-success" : "screen-alert screen-alert-error"} role="status">
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button aria-label="Cerrar alerta" className="screen-alert-close" onClick={() => setVisible(false)} type="button">
        ×
      </button>
    </div>
  );
}
