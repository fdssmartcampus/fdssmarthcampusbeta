# FDS Smart Campus

Plataforma web interactiva y portal de gestión institucional para el Instituto de Educación Superior Privado Futuro del Sur - El Carmen.

## Estructura del Proyecto
- `index.html`: Portal principal de la plataforma (renombrado para compatibilidad directa con GitHub Pages).
- `assets/video/laboratorios.mp4`: Recurso audiovisual de laboratorios.
- `assets/video/poster.jpg`: Miniatura de carga del reproductor de video.
- `.nojekyll`: Configuración para despliegue directo de archivos estáticos en GitHub Pages.

## Aplicación instalable (PWA)

Abre https://fdssmartcampus.github.io/fdssmarthcampusbeta/ y toca **Instalar aplicación**. En Android también puedes usar el menú de Chrome → Instalar aplicación. En iPhone, usa Safari → Compartir → Añadir a pantalla de inicio. En computadora, usa la opción de instalación de Chrome o Edge.

La página web conserva su contenido completo en `index.html`. La aplicación tiene su propia interfaz en `app/`: recordatorios de pensiones exportables al calendario, cuestionarios de práctica y enlaces de Quizizz/Wayground, biblioteca de guías/PDF/enlaces y minijuegos de memoria y cálculo. Usa las cuentas existentes y exige un perfil aprobado.

El administrador publica avisos, cuestionarios y materiales exclusivamente para la app en la clave `aplicacion` de `campus_contenido`, con las políticas de administrador existentes. No se modifica el esquema ni se crean cobros. Los recordatorios, marcas como atendido, resultados de práctica y récords personales se guardan por usuario en este dispositivo; no confirman pagos ni calificaciones oficiales. Para alertas con la app cerrada, importa el recordatorio `.ics` al calendario.

La PWA abre `./app/`, manteniendo el mismo identificador de instalación. Las instalaciones anteriores que abran la raíz se redirigen al panel de la app al detectar modo independiente. El enlace Página web usa `?vista=web` para permitir visitar el sitio completo desde la aplicación. El navegador normal mantiene la portada web. El service worker no guarda páginas ni respuestas de cuentas o reservas.

Las actualizaciones del service worker se activan mediante el botón **Nueva versión disponible**, para evitar recargar formularios sin aviso. Incrementa VERSION en sw.js cuando cambies los archivos de instalación.

Para ejecutar las pruebas sin dependencias: `node test-pwa.cjs` y `node test-app.cjs`.

## Agenda y premios de Mi Campus

En Inicio → Ver agenda, los estudiantes pueden consultar próximos eventos y eventos pasados, marcar Me interesa (preferencia local, sin reservar vacante) y descargar un recordatorio de calendario con hora de Perú. El administrador puede publicar y editar título, descripción, fecha, hora, lugar y enlace de inscripción.

En Minijuegos → Mis premios aparecen cuatro insignias virtuales que se desbloquean según las mejores marcas locales: completar memoria, lograr memoria en 10 movimientos o menos, conseguir 10 aciertos y conseguir 20 aciertos en cálculo. No son canje automático por productos. El administrador puede publicar premios del instituto con requisitos, vigencia y enlace de participación; el instituto valida a los ganadores y la entrega.

Eventos y convocatorias se guardan junto al contenido de la app en la clave existente `aplicacion`; se conservan cuestionarios, biblioteca y avisos anteriores. No se cambia el esquema ni las políticas de acceso. Pruebas: `node test-events.cjs`.

## Diseño de la aplicación para celular

Mi Campus usa una sola columna y cinco accesos inferiores: Inicio, Pensiones, Quiz, Biblioteca y Juegos. El perfil y el cierre de sesión están en el avatar superior. El inicio presenta el próximo recordatorio, accesos rápidos y eventos. Los juegos se abren en una pantalla propia con control para volver; los cuestionarios muestran una pregunta por vez, permiten volver conservando respuestas y ofrecen una revisión al finalizar. No cambia el archivo principal de la web, las cuentas, la base de datos ni los contenidos publicados.

La escala de la interfaz se ajusta también cuando un navegador de teléfono mantiene un viewport de escritorio; se conserva la posibilidad de ampliar la pantalla. En computadora se presenta un panel de ancho acotado con la misma navegación móvil. La instalación sigue siendo una PWA.

Validación adicional: `node test-mobile.cjs`. Verificación visual local a 390 px: inicio, navegación inferior, pantalla de memoria, navegación entre preguntas conservando selección, resultado y perfil, con datos de prueba sin conexión a cuentas reales.
