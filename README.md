# FDS Smart Campus

Plataforma web interactiva y portal de gestión institucional para el Instituto de Educación Superior Privado Futuro del Sur - El Carmen.

## Estructura del Proyecto
- `index.html`: Portal principal de la plataforma (renombrado para compatibilidad directa con GitHub Pages).
- `assets/video/laboratorios.mp4`: Recurso audiovisual de laboratorios.
- `assets/video/poster.jpg`: Miniatura de carga del reproductor de video.
- `.nojekyll`: Configuración para despliegue directo de archivos estáticos en GitHub Pages.

## Aplicación instalable (PWA)

Abre https://fdssmartcampus.github.io/fdssmarthcampusbeta/ y toca **Instalar aplicación**. En Android también puedes usar el menú de Chrome → Instalar aplicación. En iPhone, usa Safari → Compartir → Añadir a pantalla de inicio. En computadora, usa la opción de instalación de Chrome o Edge.

La aplicación utiliza el mismo acceso y las mismas funciones del campus. Necesita internet para iniciar sesión y consultar o enviar reservas. Si no hay conexión, muestra una pantalla para volver a intentarlo. Su service worker solo conserva los archivos públicos de instalación y la pantalla sin conexión; no guarda páginas del campus ni respuestas de cuentas, reservas o requerimientos.

Las actualizaciones del service worker se activan mediante el botón **Nueva versión disponible**, para evitar recargar formularios sin aviso. Incrementa VERSION en sw.js cuando cambies los archivos de instalación.

Para ejecutar las pruebas sin dependencias: `node test-pwa.cjs`.
