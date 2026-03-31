create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  tax_id text unique,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  plate text not null unique,
  normalized_plate text not null unique,
  brand text,
  model text,
  year integer,
  color text,
  engine text,
  mileage integer,
  vehicle_type text check (vehicle_type in ('City Car', 'SUV', 'Sedan', 'Camioneta', 'Furgon', 'Moto')),
  created_at timestamptz not null default now()
);

alter table public.vehicles add column if not exists normalized_plate text;
update public.vehicles set normalized_plate = upper(regexp_replace(plate, '[^A-Za-z0-9]', '', 'g')) where normalized_plate is null;
alter table public.vehicles alter column normalized_plate set not null;

create index if not exists vehicles_normalized_plate_idx on public.vehicles (normalized_plate);
create unique index if not exists vehicles_normalized_plate_unique_idx on public.vehicles (normalized_plate);

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  received_at timestamptz not null,
  invoice_type text check (invoice_type in ('Boleta', 'Factura')),
  client_signature_name text,
  reception_notes text,
  oil_type text,
  oil_volume text,
  oil_filter text,
  air_filter text,
  lubrication_price numeric(12,2),
  total_amount numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists public.work_order_services (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  service_name text not null check (
    service_name in (
      'Lavado completo',
      'Lavado carroceria',
      'Aspirado',
      'Lavado de motor',
      'Lavado de chasis',
      'Pulverizado',
      'Lavado de motos',
      'Pulido de focos',
      'Cambio de pastillas',
      'Limpieza de tapiz asientos',
      'Limpieza de tapiz alfombra',
      'Limpieza de tapiz techo',
      'Lavado de alfombra'
    )
  ),
  category text not null check (category in ('auto', 'moto')),
  price numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_services enable row level security;

create policy "authenticated customers read/write"
on public.customers
for all
to authenticated
using (true)
with check (true);

create policy "authenticated vehicles read/write"
on public.vehicles
for all
to authenticated
using (true)
with check (true);

create policy "authenticated work_orders read/write"
on public.work_orders
for all
to authenticated
using (true)
with check (true);

create policy "authenticated work_order_services read/write"
on public.work_order_services
for all
to authenticated
using (true)
with check (true);
