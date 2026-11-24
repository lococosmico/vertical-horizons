# Plan de validación antes de activar My Progress

Esta lista requiere un proyecto Supabase de prueba en Zurich o una instancia local. No se ha ejecutado contra un backend en este repositorio. Usar cuentas y datos sintéticos solo en el proyecto de prueba; nunca ejecutar estas comprobaciones en producción.

## Compilación local

- `npm ci`
- `npm run check:app` comprueba sintaxis y resolución de dependencias sin generar un bundle.
- `npm run build:css`
- La matriz adicional del hardening posterior está en `supabase/TESTING_HARDENING.md`.
- Con valores públicos reales del proyecto de prueba en `.env.local`: `npm run build:app`; verificar que se creó el bundle y que `.env.local` sigue ignorado por Git.
- Desplegar Edge Function en proyecto de prueba e invocarla desde el sitio HTTPS permitido.

## Matriz de cuentas y RLS

Crear dos alumnos de prueba A y B, una cuenta coach provisionada desde una sesión administrativa y otra cuenta C que no sea coach. Insertar datos distintos con cada cuenta.

| Identidad / estado | Comprobación | Resultado esperado |
|---|---|---|
| Anónimo | REST select en `profiles`, `activities`, `goals`, `projects`, `ascents`, `coach_notes` y metadatos de Storage | Acceso denegado |
| A | Leer, cambiar y borrar una fila de B con su UUID | Ninguna fila de B visible/modificada; inserciones con `user_id` de B rechazadas |
| B | Repetir el mismo intento sobre A | Ninguna fila de A visible/modificada |
| C no coach | `rpc('is_coach')`, `decide_coach_access`, leer notas privadas | `false`; decisión rechazada; notas invisibles |
| A sin solicitud | Lectura por el coach de perfil, actividades, entrenamientos, objetivos, proyectos, ascensiones y fotos | Sin acceso |
| A solicita, antes de aprobación | Leer datos de A por el coach y llamar a `decide_coach_access` como A | Sin acceso; llamada de A rechazada |
| Coach aprueba, A aún no comparte | Leer datos personales como coach | Sin acceso a datos; relación de coaching visible solo para las partes |
| A activa consentimiento | Leer las tablas compartidas y fotos como coach | Filas de A visibles; datos de B siguen invisibles |
| Alumno autorizado | Seleccionar e insertar en `coach_notes` como A | A no puede leer ni escribir las notas privadas |
| A desactiva compartir/revoca | Repetir consultas API del coach | Cero datos/fotos accesibles inmediatamente en nuevas solicitudes; notas privadas solo por coach |
| Coach crea una cita | Leer/modificar cita como el alumno | Alumno puede leerla mientras la relación esté activa; no puede editarla ni borrarla |
| Usuario cambia `user_id`, `coach_id`, `student_id` u otro UUID en llamadas directas | Insertar/actualizar filas relacionadas | RLS, constraints o trigger rechazan la operación |
| A borra una actividad por PostgREST | `DELETE /activities?id=eq.<uuid>` | Permiso denegado; debe usarse `delete-activity` para retirar antes los objetos |
| A llama `delete-activity` con ID de B | Edge Function autenticada | 404; ninguna fila ni objeto de B se altera |
| A llama `delete-account` sin contraseña actual o sin autenticación reciente | Edge Function autenticada | 401; cuenta y objetos permanecen |
| Storage | Subir JPEG, PNG y WebP válidos; probar SVG, vídeo, >5 MB y carpeta de otro usuario | Solo imagen permitida, hasta 5 MB, bajo `<uid>/<activity_uuid>/<uuid>.<ext>` |
| Revocación | Reutilizar una URL firmada antigua | La interfaz usa descargas autenticadas como blobs; verificar que no haya links firmados persistentes; la URL de blob local se descarta al cerrar/recargar la página |
| Borrado de cuenta | Borrar cuenta de prueba con fotos | Se crea trabajo privado; Auth y filas en cascada se borran, después Storage; si Storage falla, token recupera el mismo trabajo |

Las pruebas de llamadas directas deben ejecutarse con los JWT de cada cuenta y la clave publicable del proyecto de prueba, sin pegar ni registrar tokens en tickets, logs o capturas. Repetir las consultas con PostgREST y Storage, no solo con los botones del frontend.

## Revisión SQL

- Aplicar las tres migraciones en orden a una base vacía de prueba y revisar que cada función `SECURITY DEFINER` mantenga `search_path = ''` y nombres cualificados.
- Confirmar RLS habilitado para todas las tablas personales y comprobar grants de `anon`/`authenticated`.
- Revisar Supabase Security Advisor tras la aplicación.
- Confirmar que revocación y cambio de consentimiento bloquean lecturas nuevas en todos los recursos y que las notas del coach no aparecen en exportaciones del alumno.

El plan no equivale a una prueba superada. El formulario Auth, confirmación/recovery por correo, tráfico concurrente, copias y restauración, eliminación de cuenta, móvil y Edge Function siguen pendientes de ejecución sobre el entorno configurado.
