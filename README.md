# Clinicar Next

Migracion inicial de `Clinicar` desde PHP a una base moderna con `Next.js + React + Supabase`, manteniendo la idea del `WORK ORDER.xlsx` como formulario principal del negocio.

## Que incluye

- Login privado con `Supabase Auth`.
- Dashboard con busqueda por `patente/chapa`.
- Busqueda robusta por patente normalizada, incluso con guiones, espacios o formatos distintos.
- Formulario de orden de trabajo inspirado en el Excel original.
- Tipos de vehiculo con checks propios: `City Car`, `SUV`, `Sedan`, `Camioneta`, `Furgon` y `Moto`.
- Servicios separados para autos y motos.
- Informes filtrables por servicio, tipo de vehiculo y rango de fechas.
- Moneda operativa en `pesos chilenos (CLP)`.
- SQL base para Supabase con tablas, relaciones y politicas RLS.

## Estructura

- [app](/home/sm-des/ClinicarProyect/app): App Router de Next.js.
- [components](/home/sm-des/ClinicarProyect/components): login, shell del dashboard y formulario de work-order.
- [lib](/home/sm-des/ClinicarProyect/lib): constantes del negocio, tipos y clientes de Supabase.
- [supabase/schema.sql](/home/sm-des/ClinicarProyect/supabase/schema.sql): modelo de datos inicial para la nueva base.
- [public/logo-clinicar.jpeg](/home/sm-des/ClinicarProyect/public/logo-clinicar.jpeg): logo usado en login y dashboard.

## Levantar el proyecto

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env.local`.
3. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Ejecuta `supabase/schema.sql` en tu proyecto Supabase.
5. Crea al menos un usuario en `Authentication > Users`.
6. Inicia con `npm run dev`.

## Modelo funcional nuevo

1. Un usuario autenticado entra al panel privado.
2. Busca una `patente`; si ya existe, el sistema trae cliente y vehiculo.
3. Carga la orden con recepcion, lubricentro, servicios y total.
4. El sistema guarda cliente, vehiculo, orden y detalle de servicios.
5. Los informes permiten discriminar luego por servicio y tipo de vehiculo.

## Siguiente fase recomendada

1. Migrar los datos existentes MySQL/PHP a las tablas nuevas de Supabase.
2. Agregar generacion de PDF o impresion para cada orden.
3. Afinar permisos por rol si tendras admin, recepcion y operarios.
4. Replicar con mas fidelidad el layout exacto del Excel si quieres impresion 1:1.
