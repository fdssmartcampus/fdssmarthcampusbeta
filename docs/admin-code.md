# Código para administradores

El botón Código se añade al panel de cuentas con rol administrador y estado Aprobado. No aparece en vistas de prueba de otros roles. Su apertura requiere volver a introducir la contraseña personal del campus; no hay contraseña compartida ni clave incrustada en HTML o JavaScript.

La función campus-admin-code valida el token con Supabase Auth, consulta el rol/estado real, aplica un límite persistente de cinco solicitudes en quince minutos y verifica la contraseña mediante Auth. La sesión temporal de esa comprobación se cierra sin sustituir la sesión principal. No se registran contraseñas ni se devuelven tokens. Todas las respuestas llevan Cache-Control: no-store.

Solo después de verificar ambas condiciones se consulta el árbol de main del repositorio fijo fdssmartcampus/fdssmarthcampusbeta y se descargan los archivos textuales usando la misma revisión inmutable. Incluye HTML, CSS, JS, SQL, configuración, documentación y SVG; imágenes y videos binarios se enumeran, no se muestran como código. Nunca se consultan registros de alumnos ni secretos del servidor como parte de la descarga.

El visor permite seleccionar, copiar, descargar un archivo y descargar todos los fuentes en un JSON con rutas. El código se inserta con textContent, nunca se ejecuta ni se edita. El contenido cargado se elimina al cambiar de sección, cerrar sesión, ocultar la pestaña, salir del panel o después de cinco minutos; esto no revoca copias descargadas por un administrador.

## Límite de privacidad

El repositorio continúa público y los archivos entregados por la web siguen siendo inspeccionables. Esta función protege el visor, no convierte el código público en privado. No cambia el alojamiento ni contrata planes. El acceso a GitHub depende de su disponibilidad y límites de API.

## Despliegue

- Frontend: index.html, portal/index.html, shared/admin-code.js y shared/admin-code.css.
- Supabase: función campus-admin-code (index.ts + handler.mjs).
- SQL: database/admin_code_access.sql. Tabla con RLS sin políticas para clientes y permisos de RPC solo service_role. La ausencia de políticas es deliberada: clientes sin acceso.
- verify_jwt=false en el gateway porque el handler valida el bearer contra Auth antes de cualquier acceso. No es un endpoint anónimo.
- Usa las variables de entorno estándar SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY, solo en el servidor.

## Verificaciones

11 pruebas automáticas del handler; prueba transaccional del límite y reinicio del contador; permisos anon/authenticated revisados. El acceso completo con la cuenta real de administrador requiere una prueba manual de su propietario. No se ha solicitado ni almacenado su contraseña.
