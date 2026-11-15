# Seguridad del portal

Esta revisión conserva la identidad visual y las reglas RLS existentes. Los cambios de navegador se aplican tanto a `index.html` como a `portal/index.html`.

## Cambios

- Una respuesta antigua de perfil, cuentas, contenido o reservas no puede restaurar información tras cerrar sesión o cambiar el token.
- Un fallo al verificar el perfil vuelve a bloquear la vista privada, vacía las tablas privadas y los documentos abiertos y pausa los videos. Los datos persistidos no se borran.
- Cierre de la sesión local tras 30 minutos sin interacción de confianza, comprobado cada 15 segundos y al volver a la pestaña. No es un vencimiento impuesto por el servidor ni invalida por sí solo todos los JWT ya emitidos.
- Política CSP antes de cargar recursos: scripts locales, conexiones al proyecto Supabase, bloqueo de objetos y cambios de URL base, formularios al mismo origen y actualización de recursos HTTP a HTTPS.
- Política de referente `strict-origin-when-cross-origin`.
- Los errores con código o estado del servicio muestran un mensaje genérico, evitando devolver detalles internos de la base de datos a la interfaz.

## Límites de la CSP

El código actual conserva scripts, estilos y manejadores de eventos en línea, por lo que la CSP necesita `unsafe-inline`. Esta política limita fuentes y tipos de recursos, pero no constituye una defensa completa frente a XSS. La siguiente etapa es separar scripts y sustituir manejadores HTML por eventos registrados en JavaScript. Las imágenes y los videos HTTPS siguen admitidos para conservar las funciones de edición.

GitHub Pages no permite configurar aquí cabeceras HTTP como `frame-ancestors`, `X-Frame-Options`, `Permissions-Policy` o `X-Content-Type-Options`. No se simulan con etiquetas meta que el navegador no admitiría. Su aplicación requiere una capa de hosting que soporte esas cabeceras.

## Base de datos revisada

Se verificó seguridad por filas en las siete tablas públicas. El rol anónimo no tiene lectura de perfiles, reservas, requerimientos, pedidos, talleres ni catálogo. El contenido público conserva su política específica. Los comprobadores de administrador, personal y cuenta activa devuelven falso sin identidad autenticada. El contenedor de video es privado, con tipos y tamaño restringidos.

No se cambiaron políticas ni registros de usuarios durante esta revisión.

## Pendientes

- La comprobación de Supabase sigue señalando protección contra contraseñas filtradas desactivada. Según su documentación, está disponible en Pro o superior: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection. No se contrató un plan ni se cambió la configuración de Auth.
- Verificación visual de acceso, cierre e impresión en un navegador real antes de fusionar. Las pruebas aquí son de código y escenarios simulados, no una prueba de penetración ni una garantía de seguridad completa.
- Evaluar MFA para administración y caducidad de sesiones en servidor según las cuentas y canales de recuperación reales.

## Pruebas

Desde la raíz del repositorio:

```sh
node --test tests/security.test.cjs
```

Nueve pruebas: identidad de sesión, umbral de inactividad, perfil desactivado, respuestas atrasadas de perfil/cuentas/contenido/reservas, limpieza privada y sintaxis/protecciones de ambos HTML.
