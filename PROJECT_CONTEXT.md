# Vertical Horizons - contexto del proyecto

## Estado general

- Sitio web estático en francés e inglés, publicado en `https://verticalhorizons.ch/`.
- Repositorio: `lococosmico/vertical-horizons`.
- Carpeta de trabajo verificada: `C:\Users\guill\Documents\VH 2026 Agosto\vertical-horizons`.
- Últimos cambios locales registrados: commits de calendario, inglés y condiciones legales.

## Comparación con el sitio publicado

- Verificado el 22 de noviembre de 2026 que `index.html`, `calendrier/index.html`, `data/events.js` y `js/calendar.js` coincidían con las versiones servidas por `verticalhorizons.ch`.
- Los cambios del calendario, la ficha de aseguramiento dinámico, la página de inicio y el estilo de las tarjetas están en `main`, commit `f9ea624` (`22 COP`), sincronizado con `origin/main` el 23 de noviembre de 2026.
- La versión publicada del sitio no se ha vuelto a comprobar después de ese commit; confirmar que GitHub Pages haya terminado de desplegarlo.

## Arquitectura

- Sitio principal: `index.html`.
- Página de calendario: `calendrier/index.html`.
- Datos centrales del programa: `data/events.js`.
- Renderizado del calendario: `js/calendar.js`.
- Documentación de uso del calendario: `CALENDRIER.md`.
- Las actividades puntuales de domingo se mantienen como objetos individuales.
- Los programas recurrentes están en `recurringTemplates`.
- Las vacaciones escolares están centralizadas en `schoolBreaks`.
- Los formularios de contacto y reserva utilizan Formspree.
- Inscripciones por correo y WhatsApp se gestionan desde el código del calendario.

## Funcionamiento del calendario

- Categorías disponibles: `escalade`, `corde`, `entrainement`, `yoga`, `grande-voie`, `voyage`, `groupes`, además de categorías usadas por el sitio.
- Estados disponibles: `upcoming`, `project`, `full`, `cancelled`, `completed`, `hidden`.
- Los domingos pueden añadirse individualmente para respetar vacaciones, viajes, meteorología y cambios.
- Los recurrentes usan `recurring.weekday`: martes `2`, jueves `4`, viernes `5`, domingo `0`.
- `occurrenceCount` limita una serie a un bloque de sesiones, contando solo las fechas fuera de los periodos escolares excluidos.
- Sin `endDate`, el sistema genera seis meses a partir de la fecha actual.
- Las vacaciones deben declararse en `schoolBreaks` y pueden omitirse con `skipSchoolBreaks: true`.

## Programación actual

- Ciclo de domingos publicado entre septiembre y diciembre de 2026.
- Recurrentes:
  - Seguimiento de entrenamiento personalizado los viernes, bloque de 9 sesiones desde el 15 de enero de 2027 hasta el 19 de marzo, de 17:00 a 19:00, CHF 450; sala y/o exterior según el tiempo y el grupo, sin sesiones durante las vacaciones escolares vaudoises.
  - Hatha Yoga en Ollon los jueves desde el 3 de septiembre hasta la semana del 20 de diciembre de 2026 (última sesión: 17 de diciembre).
- Vacaciones bloqueadas: otoño 2026, Navidad 2026-2027, relache 2027 y Pascua 2027.
- Viajes visibles:
  - El Chorro, 29 de marzo-2 de abril de 2027, primera semana de las vacaciones de Pascua vaudoises.
  - Todra, 4-9 enero de 2027, confirmado como próxima oferta.
  - Costa Blanca, febrero de 2027, proyecto.
  - Leonidio, Pascua de 2027, proyecto.
- Assurage dynamique y práctica de caídas: dos sesiones indoor de 2 horas, 1 y 8 de diciembre de 2026 de 18:00 a 20:00; CHF 70 por sesión o CHF 120 ambas. La primera cubre fundamentos y timing, la segunda práctica avanzada variando superficies y alturas y requiere buen nivel de aseguramiento. Una actividad exterior de aplicación podrá ofrecerse en el futuro, aparte.
- Team Building Indoor se retiró del listado; la oferta restante se presenta como experiencia a medida sin especificar lugares o formatos.

## Pendientes conocidos

- Crear y configurar un formulario Brevo para la newsletter; integrarlo en el sitio antes de recoger suscripciones.
- Completar precios y costes adicionales de los viajes.
- Comprobar que GitHub Pages haya desplegado el commit `f9ea624` y revisar el sitio publicado.
- Comunicar por WhatsApp a los participantes las salas para las sesiones indoor de aseguramiento dinámico; esos nombres no se publican en el sitio.
- Comunicar a los clientes el nuevo bloque de seguimiento de entrenamiento por la lista de difusión de WhatsApp (la comunicación no se envía desde el sitio).
- Confirmar Costa Blanca y Leonidio.
- No se deben recoger suscripciones newsletter hasta que el formulario Brevo esté integrado y probado.

## Convenciones

- Actualizar las actividades en `data/events.js`, no duplicar datos en HTML.
- Mantener traducciones en francés e inglés.
- Evitar afirmar costes o disponibilidad si todavía no están confirmados.
- Usar `project` para iniciativas no confirmadas y `hidden` para detener series.
- Mantener flexible el programa de exterior según meteorología, roca, nivel y seguridad.
