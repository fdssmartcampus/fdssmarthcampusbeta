# FDS Smart Campus

Portal web restaurado. La aplicación anterior permanece retirada en `/app/`.

El portal usa la cuenta administradora conservada y las tablas existentes de Supabase. Los registros eliminados no se recrean con datos de ejemplo. No hay redirección automática ni instalación de la aplicación desde el portal.

## Tiendas y materiales

`shared/stores.js` y `shared/stores.css` ofrecen los catálogos Antojitos, Bazar e Inventario de Laboratorio en el portal existente. `campus_tienda.datos.productos` almacena los productos publicados por administración; las tarjetas de ejemplo no se guardan ni pueden comprarse. Los pedidos son solicitudes para recoger, pendientes de confirmación, sin cobros ni reservas automáticas de stock. La tabla `campus_pedidos` aplica permisos por usuario y administración y calcula los precios desde el catálogo mediante un trigger. El inventario y sus requerimientos conservan el flujo del campus.

`database/tiendas_pedidos.sql` documenta la migración ya aplicada en Supabase. No debe ejecutarse de nuevo sobre el mismo esquema.
