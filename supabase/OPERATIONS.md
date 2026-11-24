# My Progress: operaciones y límites

## Migración de hardening

Aplicar `202611240001_my_progress_hardening.sql` después de las migraciones `202611230001` y `202611230002`, primero en una base vacía de prueba. La migración convierte la aceptación anterior (una fila con dos versiones) en eventos separados por documento, revoca toda escritura ordinaria del cliente y conserva los eventos importados. Auth crea los dos eventos iniciales con las versiones que mantiene `public.legal_documents`; la hora UTC la asigna PostgreSQL.

El cliente exige marcar la casilla en registro y envía solo una declaración booleana, no versiones de documentos. El trigger obtiene las versiones y URLs desde la tabla administrada por la base de datos. Esta evidencia registra una declaración de aceptación, identidad y hora, pero **no prueba de forma concluyente que se haya mostrado o leído el documento ni constituye por sí sola prueba legal definitiva**: un cliente modificado puede llamar a Auth directamente y enviar la misma declaración.

Para publicar una versión nueva, actualizar administrativamente la fila de `legal_documents` correspondiente (versión y URL). Las aceptaciones anteriores permanecen como eventos inmutables para el cliente. En el siguiente acceso autenticado, la app detecta que falta la versión actual, bloquea la navegación de su interfaz, muestra el enlace y solicita una nueva aceptación. La RPC registra solo los documentos vigentes que aún no constan como aceptados. Las políticas RLS también usan `has_current_legal_acceptance`: las lecturas y escrituras ordinarias de datos privados quedan bloqueadas hasta completar la versión actual, incluso por API directa. Las filas de documentos y aceptaciones siguen accesibles para que se complete el flujo. Si se configura mal el catálogo de documentos, la comprobación falla cerrada.

## Exportación

El botón descarga un JSON estructurado con el correo y otros campos relevantes de Auth, perfil, actividades, ejercicios, ascensiones, objetivos, proyectos, enlaces, aceptación legal, metadatos de archivos, relación de coaching y citas del alumno. Lee páginas de 100 filas con conteo exacto; aborta si cambia el total durante la exportación o si falta una página. Las notas privadas del coach y tokens no se exportan. El binario de fotos no se incluye en esta versión; el JSON lo declara expresamente y conserva sus metadatos.

## Guardado y borrado de actividades/fotos

`public.save_activity` es una RPC `SECURITY INVOKER`: actividad, enlaces de objetivos y ejercicios se guardan en una transacción PostgreSQL y siguen sujetos a permisos y RLS del usuario. Las fotos se convierten a WebP en el navegador, se suben después de la transacción y se vinculan mediante metadatos. Storage y PostgreSQL no comparten una transacción. Si falla la foto, la actividad estructurada queda guardada y el formulario conserva su ID para volver a intentar la foto; no se muestra éxito completo. Si falla el borrado compensatorio del objeto, borrar la actividad más tarde vuelve a recorrer su prefijo privado para retirar archivos huérfanos.

`activity_attachments` ya no permite `DELETE` directo y Storage no permite `UPDATE`/`DELETE` directo al rol `authenticated`. La compensación de una foto subida sin metadatos usa `delete-photo`, que valida JWT y prefijo del dueño. Borrar una actividad pasa por `delete-activity`: comprueba propietario, limpia recursivamente solo `<uid>/<activity_id>/` y después elimina la fila. Si falla Storage, la actividad y metadatos permanecen; si Storage se borró pero falla PostgreSQL, un reintento repite la limpieza y elimina la fila. Si la fila ya no existe, limpia únicamente ese prefijo del usuario autenticado y responde idempotentemente. Un UUID ajeno devuelve 404 sin tocar Storage.

## Borrado de cuenta y recuperación

`delete-account` comprueba origen, método, JWT, identidad y `auth_time` reciente; crea un trabajo con un hash SHA-256 de un token aleatorio generado por el navegador. El trabajo no referencia `auth.users`, así que sobrevive a la cascada. Después elimina la identidad Auth (que elimina filas relacionales en cascada), limpia recursivamente el prefijo privado de fotos y marca el trabajo completo. Si falla cualquier etapa, el token guardado en el mismo navegador permite reintentar en `deletion-pending.html`; el endpoint valida el hash y no necesita confiar en el ID de usuario enviado por el cliente. La función debe usar `verify_jwt = false` en el gateway porque la ruta de recuperación usa ese secreto aleatorio; dentro de la función se autentica el flujo inicial y se valida el token de recuperación contra el trabajo guardado.

El token de recuperación es una capacidad temporal para terminar esa misma eliminación; no sirve para iniciar sesión ni acceder a datos. Si se pierde antes de terminar, el trabajo debe resolverse desde una sesión operativa segura. Añadir una política de retención y limpieza de trabajos completados antes de activar el servicio.

Eliminar Auth, datos operacionales y Storage no elimina instantáneamente copias de seguridad administradas por el proveedor. La retención y restauración de backups dependen del plan y configuración del proyecto; informar el plazo aplicable desde la configuración real y las condiciones del proveedor.

## XSS y política del navegador

Las plantillas dinámicas deben escapar todos los valores de usuario con `esc()` antes de insertarlos en HTML. Los mensajes y errores se escriben con `textContent`. Las fotos aceptadas se decodifican y vuelven a codificar como WebP antes de subirlas, retirando metadatos y contenido original; el servidor sigue aplicando tamaño, MIME permitido y RLS. No se insertan scripts inline ni se requieren CDNs para My Progress.

GitHub Pages no permite configurar cabeceras HTTP arbitrarias para este sitio. La CSP debe ponerse en el hosting que termine HTTPS, o en el CDN/proxy que lo preceda. **Aplicar la política estricta solo a las respuestas `/my-progress/*`**: el resto del sitio contiene scripts y estilos inline, Google Fonts, Remix Icon y formularios Formspree; una CSP global con `script-src 'self'` rompería páginas públicas. Si el CDN no permite reglas por ruta, empezar con `Content-Security-Policy-Report-Only` y revisar el sitio completo antes de imponer una cabecera global.

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://<project-ref>.supabase.co wss://<project-ref>.supabase.co; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Configurar también HSTS solo después de confirmar que todo el dominio sirve HTTPS. `frame-ancestors` debe enviarse como cabecera HTTP, no como meta CSP. Probar registro, Auth callback, Storage blob previews y Edge Function desde el dominio configurado antes de endurecer la política. Si en el futuro se añade OAuth, fuentes externas o recursos remotos, actualizar la allowlist de forma explícita.
