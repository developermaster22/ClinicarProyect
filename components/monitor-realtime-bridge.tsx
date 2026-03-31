"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function MonitorRealtimeBridge() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: number | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }

      refreshTimer = window.setTimeout(() => {
        router.refresh();
      }, 250);
    };

    const channel = supabase
      .channel("monitor-live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "work_order_services" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "work_orders" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, scheduleRefresh)
      .subscribe();

    return () => {
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }

      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
