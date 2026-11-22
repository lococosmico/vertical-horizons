# Vertical Horizons - contexto del proyecto

## Estado general

- Sitio web estático en francés e inglés, publicado en `https://verticalhorizons.ch/`.
- Repositorio: `lococosmico/vertical-horizons`.
- Carpeta de trabajo verificada: `C:\Users\guill\Documents\VH 2026 Agosto\vertical-horizons`.
- Últimos cambios locales registrados: commits de calendario, inglés y condiciones legales.

## Comparación con el sitio publicado

- Verificado el 22 de noviembre de 2026 que `index.html`, `calendrier/index.html`, `data/events.js` y `js/calendar.js` coincidían con las versiones servidas por `verticalhorizons.ch`.
- Los cambios de esta conversación están aplicados localmente y aún deben publicarse para reflejarse en el sitio.

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
- Los recurrentes usan `recurring.weekday`: martes `2`, jueves `4`, domingo `0`.
- Sin `endDate`, el sistema genera seis meses a partir de la fecha actual.
- Las vacaciones deben declararse en `schoolBreaks` y pueden omitirse con `skipSchoolBreaks: true`.

## Programación actual

- Ciclo de domingos publicado entre septiembre y diciembre de 2026.
- Recurrentes:
  - Entrenamiento escalada los martes desde el 1 de septiembre de 2026.
  - Hatha Yoga en Ollon los jueves desde el 3 de septiembre de 2026.
- Vacaciones bloqueadas: otoño 2026, Navidad 2026-2027, relache 2027 y Pascua 2027.
- Viajes visibles:
  - El Chorro, 29 de marzo-2 de abril de 2027, primera semana de las vacaciones de Pascua vaudoises.
  - Todra, 4-9 enero de 2027, confirmado como próxima oferta.
  - Costa Blanca, febrero de 2027, proyecto.
  - Leonidio, Pascua de 2027, proyecto.
- Assurage dynamique: CHF 360 para las dos sesiones indoor, el 1 y el 8 de diciembre de 2026 de 18:00 a 20:00; sala por confirmar entre Villeneuve, Saxon y Echandens. La sesión exterior en Saint-Triphon se planificará aparte según la meteorología.
- Team Building Indoor se retiró del listado; la oferta restante se presenta como experiencia a medida sin especificar lugares o formatos.

## Pendientes conocidos

- Configurar un proveedor real para el formulario newsletter.
- Completar precios y costes adicionales de los viajes.
- Confirmar la sala para las sesiones indoor de aseguramiento dinámico.
- Planificar la sesión exterior de aseguramiento dinámico cuando la meteorología sea favorable.
- Confirmar Costa Blanca y Leonidio.
- No se deben recoger suscripciones newsletter hasta que el proveedor esté configurado.

## Convenciones

- Actualizar las actividades en `data/events.js`, no duplicar datos en HTML.
- Mantener traducciones en francés e inglés.
- Evitar afirmar costes o disponibilidad si todavía no están confirmados.
- Usar `project` para iniciativas no confirmadas y `hidden` para detener series.
- Mantener flexible el programa de exterior según meteorología, roca, nivel y seguridad.
