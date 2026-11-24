# Validación del hardening

Ejecutar estas comprobaciones solo en Supabase local o un proyecto desechable. No se han ejecutado contra un backend en este repositorio.

## Migración y consentimiento

- Aplicar `202611240001_my_progress_hardening.sql` después de `001` y `002` en una base vacía.
- Verificar que el trigger Auth rechaza `legal_accepted` ausente/falso.
- Crear un usuario de prueba por registro y confirmar dos filas en `legal_acceptances`, versiones tomadas de `legal_documents`, hora UTC de PostgreSQL y `context=web_signup`.
- Como authenticated, intentar `INSERT`, `UPDATE` y `DELETE` en aceptaciones: todos deben ser denegados; `SELECT` propio permitido y ajeno vacío.
- Cambiar una versión desde una sesión administrativa, iniciar sesión en app y verificar que la navegación queda en el gate hasta aceptar. Confirmar que la RPC crea solo el evento que faltaba. Antes de aceptar, probar también REST/Storage/RPC con JWT directo: políticas RLS deben bloquear datos privados; catálogo y aceptación propia deben seguir accesibles.
- Revisar que el evento acredita una declaración, no que el usuario realmente vio el documento.

## Exportación

- Crear más de 1.000 filas de cada tipo exportado accesibles al usuario y comparar los conteos con JSON descargado.
- Verificar correo, teléfono y timestamps de cuenta; perfil, aceptaciones, sesiones, ejercicios, ascensiones, objetivos, proyectos, enlaces, metadatos, relación y citas del alumno.
- Confirmar que no aparecen `coach_notes`, datos de otros usuarios, tokens ni bytes de fotos; el JSON debe declarar la exclusión de los binarios.
- Simular error en una página y cambios de conteo durante la descarga. No debe ofrecerse un JSON parcial como exportación completa.

## Actividades y fotos

- Guardar o modificar actividad, ejercicios y objetivos; provocar error de constraint en cualquiera de esos componentes y comprobar rollback de toda la RPC `save_activity`.
- Probar tipos permitidos/no permitidos, archivo inválido, más de 5 MB, dimensiones extremas y metadatos EXIF. El objeto almacenado debe ser WebP decodificado/recodificado.
- Intentar borrar `activity_attachments` directamente como authenticated: denegado.
- Borrar actividad con varias fotos; provocar fallo de Storage, luego fallo SQL, y reintentar el mismo UUID. Debe limpiar recursivamente solo `<uid>/<activity_id>/`, eliminar fila/metadatos al completar y nunca afectar el UUID de otro alumno.
- Crear objeto huérfano dentro del prefijo de actividad y comprobar que el borrado recupera el objeto aunque falte su fila de metadatos.

## Borrado de cuenta

- Sin JWT, con JWT inválido, sin contraseña reciente y con token de recuperación inválido: operación denegada.
- Confirmar que la función crea un job privado y que el hash, no el token en claro, queda guardado.
- Forzar fallo antes de borrar Auth, entre Auth y Storage, y durante la limpieza; probar reintento con el mismo token desde `deletion-pending.html`.
- Tras completar, verificar ausencia de identidad, filas relacionales y objetos, y que una repetición del token responda éxito idempotente.
- Confirmar que `service_role` solo aparece en secretos Edge y que el frontend limpia todas las claves `sb-*` antes de redirigir.
- Revisar backups y retención del proveedor por separado; el borrado de datos activos no implica purga inmediata de backups.

## CSP y XSS

- Revisar con datos de prueba nombres, descripciones, notas y comentarios con HTML/atributos maliciosos; deben mostrarse como texto y no ejecutarse.
- Aplicar la CSP de `OPERATIONS.md` en staging sustituyendo el Project URL, abrir consola y validar registro/Auth callbacks, consultas REST, imágenes blob y Edge Functions.
- Comprobar cabeceras HTTP reales: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` y, solo con HTTPS completo, HSTS.
