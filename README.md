# Vertical Horizons

Sitio estático bilingüe (francés/inglés), publicado actualmente desde GitHub Pages. Usa HTML, CSS, JavaScript y Tailwind. El calendario público existente sigue en `calendrier/`, `js/calendar.js` y `data/events.js`.

## My Progress — estado

La página de presentación, las pantallas de autenticación y la interfaz privada están en `my-progress/`. El código cliente usa la biblioteca oficial `@supabase/supabase-js`; `src/my-progress/` es el código fuente y `my-progress/assets/app.js` es el fallback seguro que avisa que el servicio no está configurado. `npm run build:app` reemplaza ese fallback por un bundle real cuando se proporcionan la URL de Supabase y la clave pública.

El repositorio contiene tres migraciones y tres funciones Supabase Edge de limpieza y borrado. No hay todavía proyecto Supabase enlazado, migración aplicada, usuario propietario configurado ni pruebas contra un backend real. No se deben abrir registros hasta completar la preparación de abajo.

## Arquitectura

- **Frontend:** sitio estático HTML/CSS/JS y Tailwind; no se añade framework de servidor.
- **Bundle:** `esbuild` empaqueta el cliente oficial de Supabase para navegador.
- **Backend:** Supabase Auth, PostgreSQL con RLS y Storage privado.
- **Región sugerida:** Zúrich (`eu-central-2`). La región de un proyecto Supabase no se cambia; se escoge al crearlo.
- **Limpieza y borrado:** funciones Supabase Edge autenticadas. La clave `service_role` solo se configura como secreto del backend de esas funciones y nunca se entrega al frontend.
- **Hosting actual:** GitHub Pages sirve archivos estáticos y no inyecta variables de entorno en tiempo de ejecución. La URL y clave pública se incorporan al bundle durante el build. Se pueden usar GitHub Actions variables para compilar; ambas son valores públicos por diseño.

## Funcionalidad de frontend preparada

- Registro con verificación de email, conexión, cierre de sesión y recuperación/actualización de contraseña mediante Supabase Auth.
- Perfil deportivo, exportación JSON y solicitud de eliminación de cuenta.
- Crear, editar, consultar y eliminar actividades; actividades planificadas y realizadas; vínculos con objetivos.
- Bloques de ejercicios flexibles: series, repeticiones, carga, duración, descanso e intensidad.
- Diario de escalada con intentos fechados, grado, disciplina, estilo, proyecto asociado y filtros de texto.
- Objetivos y proyectos con cambios de estado y edición.
- Vista mensual del calendario privado, usando Europe/Zurich para entrada y agrupación horaria.
- Flujo de solicitud de coaching, aprobación solo por la cuenta coach provisionada, consentimiento posterior y revocación.
- Panel coach para consultar registros compartidos y añadir notas privadas separadas.
- Fotografías JPEG/PNG/WebP transformadas a WebP de hasta 5 MB en bucket privado; se muestran mediante descarga autenticada y URL de blob local. No se admiten vídeos.

La interfaz opera solo con respuestas reales de Supabase; no usa datos ficticios. Sin un bundle compilado y un proyecto configurado, el fallback no envía formularios ni afirma guardar nada.

## Base de datos y control de acceso

1. `supabase/migrations/202611230001_my_progress.sql`: perfiles, aceptación versionada de condiciones/privacidad, actividades multideporte, objetivos, proyectos, intentos/ascensiones, relación coach/alumno, notas privadas, funciones de consentimiento y RLS.
2. `supabase/migrations/202611230002_training_goals_storage.sql`: ejercicios, relación actividad-objetivo, metadatos y bucket privado de imágenes, políticas de Storage, consentimiento y revocación.
3. `supabase/migrations/202611240001_my_progress_hardening.sql`: eventos de aceptación legal de solo lectura para el cliente, renovación versionada, RPC transaccional para guardar sesiones, revocación del borrado directo de metadatos y tabla privada de recuperación de eliminación de cuenta.

Todas las tablas personales tienen RLS habilitado. Las políticas de coach verifican una relación activa y, para datos personales, que el alumno haya activado el uso compartido. Revocar o desactivar el consentimiento corta el acceso de lectura inmediatamente. `coach_access` no permite escrituras directas del cliente; las decisiones se hacen por RPC controladas. `coach_notes` es legible únicamente por el coach provisionado. Los intentos de asignarse el rol coach desde el cliente no tienen una ruta permitida.

El entrenamiento se almacena en `training_exercises` ligado a una actividad tipo entrenamiento. Una fecha y una vía pueden tener varias filas de intentos. Los enlaces de intentos, proyectos, actividades y objetivos se validan contra el mismo propietario.

## Configurar Supabase

1. Crear manualmente un proyecto llamado Vertical Horizons en la región específica `eu-central-2` (Zurich). No usar la región genérica “Europe” si se requiere ubicación exacta. Revisar condiciones, DPA y flujos de datos antes de incorporar información real.
2. Aplicar las tres migraciones, en orden, con Supabase CLI enlazado al proyecto (`supabase link --project-ref <PROJECT_REF>` y `supabase db push`) o ejecutando `001`, `002` y `003` en el SQL Editor. Revisar errores y políticas en el panel antes de continuar.
3. En Authentication → URL Configuration, configurar el sitio `https://verticalhorizons.ch` y permitir como callbacks:
   - `https://verticalhorizons.ch/my-progress/app.html`
   - `https://verticalhorizons.ch/my-progress/reset.html`
   - Durante desarrollo: `http://localhost:8000/my-progress/app.html` y `http://localhost:8000/my-progress/reset.html`.
4. Configurar verificación de email, proveedor SMTP de producción, plantillas de confirmación/recuperación, duración de sesión, política de contraseña y límites de solicitudes. La configuración de correo puede tener coste propio.
5. Crear la cuenta del propietario con registro normal y confirmar el email. Copiar su UUID desde Authentication → Users y, desde una sesión administrativa controlada, ejecutar:

   ```sql
   insert into public.coach_admins (user_id) values ('<UUID_REAL_DEL_PROPIETARIO>');
   ```

   Reemplazar el marcador de posición; no almacenar ese UUID como credencial. Esta es una operación administrativa de una sola vez. No añadir una interfaz cliente para asignar roles.
6. Configurar los secretos de las Edge Functions en Supabase (Dashboard → Edge Functions → Secrets o Supabase CLI): `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. La última se usa exclusivamente dentro de las funciones de servidor; nunca colocarla en `.env.local`, GitHub Pages ni en el bundle.
7. Desplegar `delete-account`, `delete-activity` y `delete-photo` con Supabase CLI (`supabase functions deploy delete-account`, `supabase functions deploy delete-activity`, `supabase functions deploy delete-photo`). `delete-activity` y `delete-photo` mantienen verificación JWT del gateway. `delete-account` la desactiva para permitir el token de recuperación después de eliminar Auth, pero valida el JWT y la reautenticación reciente en la ruta inicial; la ruta de recuperación exige un token aleatorio de 256 bits cuyo hash está en la tabla privada de trabajos. Comprobar CORS si cambia el dominio.
8. Copiar `.env.example` a `.env.local`, completar los valores públicos del proyecto (Project URL y publishable key; la antigua anon key también es pública, aunque se prefiere publishable) y compilar:

   ```powershell
   Copy-Item .env.example .env.local
   # Editar .env.local y definir SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY
   npm ci
   npm run build:app
   ```

   `SUPABASE_URL` debe ser la URL de `https://<project-ref>.supabase.co`. `SUPABASE_PUBLISHABLE_KEY` es la publishable/anon key del cliente. Nunca añadir `service_role`, secret keys, contraseña de PostgreSQL o credenciales SMTP al frontend.
9. Para publicar estáticamente, ejecutar build en un entorno controlado con esas dos variables públicas. Con GitHub Actions, guardarlas como **Variables** del repositorio (no hace falta tratarlas como secretas), construir el bundle y desplegar el contenido del sitio. La clave publishable no concede por sí misma acceso a datos: RLS debe estar activa y verificada. No subir `.env.local`.
10. Abrir registro solo después de realizar las pruebas con cuentas separadas de alumno y coach, incluyendo acceso REST directo y Storage.

El script de build valida que URL/clave estén presentes y no crea el bundle si falta configuración. `my-progress/assets/app.js` puede ser sobrescrito al conectar un proyecto; el bundle incluye URL y clave pública y puede publicarse. La cuenta service role no puede.

## Desarrollo y comprobaciones locales

```powershell
npm ci
npm run build:css
npm run check:app
```

Para un bundle conectado, crear `.env.local` siguiendo `.env.example` y ejecutar `npm run build:app`. Servir la carpeta raíz con una extensión de servidor estático local de VS Code en el puerto 8000 y añadir las URLs de callback locales anteriores. Sin credenciales reales no se puede probar Auth, RLS, Storage, eliminación ni el flujo coach.

## Privacidad, exportación y borrado

- La exportación genera JSON paginado en el navegador; comprueba conteos, duplicados y hace una segunda lectura de verificación antes de descargar. Incluye correo y datos pertinentes de Auth, eventos legales, datos propios y metadatos de fotos, pero no bytes de fotos, tokens ni notas privadas del coach. No es una instantánea transaccional única.
- Guardar una actividad y sus ejercicios/enlaces usa una RPC `SECURITY INVOKER` transaccional. La foto se procesa y sube después; si falla, el registro estructurado queda guardado y el formulario conserva el ID para reintentar la foto.
- La eliminación de una actividad pasa por Edge Function, limpia recursivamente su prefijo privado para recuperar objetos huérfanos, y luego elimina la fila. La eliminación de cuenta exige contraseña y `auth_time` reciente, crea un trabajo con token de recuperación, elimina Auth y limpia Storage. Los fallos se pueden reintentar desde `deletion-pending.html`; la cascada de Auth elimina filas relacionales.
- Las notas privadas del coach no forman parte de la exportación ni son visibles para el alumno. La exportación incluye los eventos versionados de aceptación por documento. Las versiones actuales se mantienen administrativamente en `legal_documents`.
- No hay seguimiento publicitario en el área privada.
- La revocación de coaching bloquea las lecturas posteriores por RLS. Los eventos de aceptación legal quedan protegidos contra cambios ordinarios del cliente. El registro es evidencia técnica de una declaración y su versión/hora de servidor; no demuestra por sí solo que el documento se haya mostrado o leído ni constituye prueba legal definitiva.

Debe revisarse legalmente la información de privacidad, finalidades, plazos de conservación, derechos, procesadores, transferencias y el alcance territorial LPD/RGPD. El repositorio no representa una certificación de cumplimiento. Revisar la [LPD suiza](https://www.fedlex.admin.ch/eli/cc/2022/491/en) y la guía del [PFPDT sobre avisos de privacidad](https://www.edoeb.admin.ch/en/privacy-statements-on-the-internet).

## Límites conocidos y pruebas pendientes

- Aún no hay proyecto Supabase ni configuración real: las pantallas y consultas no se han ejecutado contra base de datos.
- No se ha ejecutado la migración con Postgres/Supabase ni se ha hecho una revisión automatizada con dos cuentas. Las garantías RLS deben verificarse en el proyecto final antes de producción.
- No hay sistema de auditoría inmutable, librería de ejercicios compartida, fotos de perfil, filtros avanzados por grado/fecha/sector, vista semanal, flujo de sesiones coach independientes, ni gestión de notificaciones/email de solicitud.
- La recuperación y confirmación dependen de configurar correo y URLs de retorno en Supabase.
- Las funciones de borrado requieren `SUPABASE_SERVICE_ROLE_KEY` solo en secretos de Supabase y aún deben desplegarse y probarse.
- La aceptación de documentos posteriores se exige en la interfaz y las políticas RLS comprueban las versiones actuales antes de permitir lecturas/escrituras privadas ordinarias. Los documentos pendientes y los propios eventos de aceptación siguen disponibles para completar el flujo.
- La planificación de sesión se realiza como actividad planificada; no hay integración con calendarios externos.
- Los archivos se borran al eliminar una actividad desde la interfaz; al borrar la cuenta los limpia la Edge Function. No habilitar nuevos buckets públicos.
- Los trabajos de eliminación de cuenta deben tener una política operativa de retención/limpieza. Las copias de seguridad del proveedor siguen su propio plazo y no desaparecen en el momento del borrado.

## Hardening, CSP y validación

La guía de aceptación, exportación, borrados, límites de backups y la política CSP de ejemplo está en [`supabase/OPERATIONS.md`](supabase/OPERATIONS.md). GitHub Pages no configura cabeceras HTTP; CSP, HSTS y demás cabeceras deben configurarse en el hosting o CDN que sirva el sitio. Los planes de pruebas están en [`supabase/TESTING.md`](supabase/TESTING.md) y [`supabase/TESTING_HARDENING.md`](supabase/TESTING_HARDENING.md). Las migraciones y flujos no se consideran verificados hasta ejecutarlos contra PostgreSQL/Supabase de prueba.

## Hosting y costes

GitHub Pages puede seguir sirviendo el frontend estático según la cuenta y sus límites. Supabase publica un nivel Free de **0 USD/mes**, con cuotas y pausa de proyectos inactivos, y un nivel Pro desde **25 USD/mes**, con copias diarias de siete días. El almacenamiento Free publicado es 1 GB. SMTP de producción, dominio/servicios opcionales, copias adicionales y exceso de uso pueden añadir coste. Revisar los precios antes de lanzamiento: [Supabase Pricing](https://supabase.com/pricing). No se ha elegido ni creado un proyecto, y esta implementación no ha generado gastos de hosting.
