import { createClient } from "@/lib/supabase/server";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type WorkOrderRow = {
  id: string;
  received_at: string;
  total_amount: number | null;
  customers: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null;
  vehicles: { plate: string | null; brand: string | null; model: string | null; vehicle_type: string | null } | {
    plate: string | null;
    brand: string | null;
    model: string | null;
    vehicle_type: string | null;
  }[] | null;
};

type ServiceRow = {
  id: string;
  service_name: string;
  category: "auto" | "moto";
  price: number | null;
  notes: string | null;
  work_orders:
    | {
        id: string;
        received_at: string;
        total_amount: number | null;
        customers: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null;
        vehicles:
          | { plate: string | null; brand: string | null; model: string | null; vehicle_type: string | null }
          | { plate: string | null; brand: string | null; model: string | null; vehicle_type: string | null }[]
          | null;
      }
    | {
        id: string;
        received_at: string;
        total_amount: number | null;
        customers: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null;
        vehicles:
          | { plate: string | null; brand: string | null; model: string | null; vehicle_type: string | null }
          | { plate: string | null; brand: string | null; model: string | null; vehicle_type: string | null }[]
          | null;
      }[]
    | null;
};

function getDateKey(value: string, timeZone = "America/Santiago") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export async function getDashboardMetrics() {
  const supabase = await createClient();

  const [{ data: workOrders }, { data: serviceRows }] = await Promise.all([
    supabase
      .from("work_orders")
      .select("id, received_at, total_amount, customers(full_name, phone), vehicles(plate, brand, model, vehicle_type)")
      .order("received_at", { ascending: false })
      .limit(300),
    supabase
      .from("work_order_services")
      .select(
        "id, service_name, category, price, notes, work_orders(id, received_at, total_amount, customers(full_name, phone), vehicles(plate, brand, model, vehicle_type))",
      )
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const orders = (workOrders ?? []) as WorkOrderRow[];
  const services = (serviceRows ?? []) as ServiceRow[];
  const todayKey = getDateKey(new Date().toISOString());

  const customerStats = new Map<string, { name: string; orders: number; total: number }>();
  const vehicleTypeStats = new Map<string, number>();
  const serviceStats = new Map<string, number>();

  orders.forEach((order) => {
    const customer = one(order.customers);
    const vehicle = one(order.vehicles);
    const customerName = customer?.full_name?.trim() || "Cliente sin nombre";
    const vehicleType = vehicle?.vehicle_type?.trim() || "Sin tipo";
    const currentCustomer = customerStats.get(customerName) ?? { name: customerName, orders: 0, total: 0 };

    currentCustomer.orders += 1;
    currentCustomer.total += order.total_amount ?? 0;
    customerStats.set(customerName, currentCustomer);
    vehicleTypeStats.set(vehicleType, (vehicleTypeStats.get(vehicleType) ?? 0) + 1);
  });

  services.forEach((service) => {
    serviceStats.set(service.service_name, (serviceStats.get(service.service_name) ?? 0) + 1);
  });

  const bestCustomer =
    [...customerStats.values()].sort((left, right) => {
      if (right.orders !== left.orders) {
        return right.orders - left.orders;
      }

      return right.total - left.total;
    })[0] ?? null;

  const mostWashedVehicleType =
    [...vehicleTypeStats.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([type, count]) => ({ type, count }))[0] ?? null;

  const topService =
    [...serviceStats.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([name, count]) => ({ name, count }))[0] ?? null;

  const todayServices = services
    .map((service) => {
      const workOrder = one(service.work_orders);
      const customer = one(workOrder?.customers);
      const vehicle = one(workOrder?.vehicles);

      return {
        id: service.id,
        serviceName: service.service_name,
        category: service.category,
        price: service.price ?? 0,
        notes: service.notes,
        receivedAt: workOrder?.received_at ?? "",
        customerName: customer?.full_name ?? "Cliente sin nombre",
        phone: customer?.phone ?? null,
        plate: vehicle?.plate ?? "-",
        brand: vehicle?.brand ?? "",
        model: vehicle?.model ?? "",
        vehicleType: vehicle?.vehicle_type ?? "Sin tipo",
      };
    })
    .filter((service) => service.receivedAt && getDateKey(service.receivedAt) === todayKey)
    .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt));

  return {
    workOrderCount: orders.length,
    customerCount: customerStats.size,
    vehicleCount: new Set(orders.map((order) => one(order.vehicles)?.plate).filter(Boolean)).size,
    totalRevenue: orders.reduce((acc, order) => acc + (order.total_amount ?? 0), 0),
    todayServices,
    todayServicesCount: todayServices.length,
    bestCustomer,
    mostWashedVehicleType,
    topService,
    todayLabel: new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date()),
  };
}
