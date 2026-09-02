(function () {
  "use strict";

  const source = window.VERTICAL_HORIZONS_EVENTS || { events: [], recurringTemplates: [] };
  const categoryLabels = {
    escalade: ["Escalade", "Climbing"],
    corde: ["Manipulations & sécurité", "Rope handling & safety"],
    formation: ["Formation", "Training"],
    entrainement: ["Entraînement", "Training"],
    yoga: ["Yoga", "Yoga"],
    "grande-voie": ["Grande voie", "Multi-pitch"],
    voyage: ["Voyages", "Trips"],
    aventure: ["Aventure", "Adventure"],
    groupes: ["Groupes", "Groups"]
  };
  const categoryIcons = {
    escalade: "ri-landscape-line",
    corde: "ri-links-line",
    formation: "ri-graduation-cap-line",
    entrainement: "ri-barbell-line",
    yoga: "ri-leaf-line",
    "grande-voie": "ri-mountain-line",
    voyage: "ri-compass-3-line",
    aventure: "ri-compass-3-line",
    groupes: "ri-group-line"
  };
  const categoryOrder = ["escalade", "corde", "entrainement", "yoga", "grande-voie", "voyage", "formation", "aventure", "groupes"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  function isEnglish() {
    return !!document.querySelector('.language-btn[data-lang="en"].active');
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function dateValue(date) {
    if (!date) return null;
    const value = new Date(date + "T00:00:00");
    return Number.isNaN(value.getTime()) ? null : value;
  }

  function formatDate(date) {
    const value = dateValue(date);
    if (!value) return "";
    return new Intl.DateTimeFormat(isEnglish() ? "en-GB" : "fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(value);
  }

  function formatShortDate(date) {
    const value = dateValue(date);
    if (!value) return "";
    return new Intl.DateTimeFormat(isEnglish() ? "en-GB" : "fr-FR", {
      weekday: "short", day: "numeric", month: "short"
    }).format(value);
  }

  function categoryLabel(category) {
    const label = categoryLabels[category] || [category, category];
    return escapeHtml(label[isEnglish() ? 1 : 0]);
  }

  function eventTitle(event) {
    return escapeHtml(isEnglish() ? (event.titleEn || event.title) : event.title);
  }

  function eventDescription(event) {
    return escapeHtml(isEnglish() ? (event.descriptionEn || event.description) : event.description);
  }

  function isSchoolBreak(date) {
    return (source.schoolBreaks || []).some(function (period) {
      return date >= dateValue(period.start) && date <= dateValue(period.end);
    });
  }

  function expandRecurring(items) {
    const expanded = [];
    items.forEach(function (event) {
      if (!event.recurring || typeof event.recurring.weekday !== "number" || !event.startDate) {
        expanded.push(event);
        return;
      }
      const start = dateValue(event.startDate);
      const end = event.endDate ? dateValue(event.endDate) : new Date(today);
      if (!start || !end || event.status === "hidden") return;
      if (!event.endDate) end.setMonth(end.getMonth() + 6);
      const cursor = new Date(start);
      while (cursor <= end) {
        if (cursor.getDay() === event.recurring.weekday) {
          const date = cursor.getFullYear() + "-" + String(cursor.getMonth() + 1).padStart(2, "0") + "-" + String(cursor.getDate()).padStart(2, "0");
          if (event.skipSchoolBreaks && isSchoolBreak(dateValue(date))) {
            cursor.setDate(cursor.getDate() + 1);
            continue;
          }
          expanded.push(Object.assign({}, event, {
            id: event.id + "-" + date,
            date: date,
            recurring: true
          }));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return expanded;
  }

  function getEvents() {
    return expandRecurring((source.events || []).concat(source.recurringTemplates || []))
      .filter(function (event) { return event.status !== "hidden"; })
      .filter(function (event) { return (event.date && dateValue(event.date)) || event.dateLabel || (event.dateOptions && event.dateOptions.length); })
      .sort(function (a, b) {
        const aDate = dateValue(a.date || (a.dateOptions && a.dateOptions[0] && a.dateOptions[0].start));
        const bDate = dateValue(b.date || (b.dateOptions && b.dateOptions[0] && b.dateOptions[0].start));
        if (!aDate && !bDate) return String(a.title).localeCompare(String(b.title));
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate - bDate;
      });
  }

  function eventDateLabel(event) {
    if (event.dateOptions && event.dateOptions.length) return escapeHtml(event.dateOptions.map(function (option) { return option.label; }).join(" ou ") + (event.dateStatus === "to-confirm" ? " - dates à confirmer" : ""));
    return event.dateLabel ? escapeHtml(event.dateLabel) : escapeHtml(formatDate(event.date));
  }

  function statusLabel(event) {
    const labels = {
      project: isEnglish() ? "Project" : "Projet",
      upcoming: isEnglish() ? "Open for registration" : "Ouvert aux inscriptions",
      full: isEnglish() ? "Full" : "Complet",
      cancelled: isEnglish() ? "Cancelled" : "Annulé"
    };
    return labels[event.status] || "";
  }

  function availability(event) {
    if (event.status === "full") return isEnglish() ? "Full" : "Complet";
    if (typeof event.placesAvailable !== "number") return "";
    if (event.placesAvailable === 0) return isEnglish() ? "Full" : "Complet";
    if (event.placesAvailable <= 2) return isEnglish() ? "Only " + event.placesAvailable + " places left" : "Plus que " + event.placesAvailable + " place" + (event.placesAvailable > 1 ? "s" : "");
    return (isEnglish() ? "Places available: " : "Places disponibles : ") + event.placesAvailable;
  }

  function price(event) {
    if (!event.price) return "";
    return escapeHtml(event.price);
  }

  function eventCard(event, compact) {
    const full = event.status === "full" || event.placesAvailable === 0;
    const cancelled = event.status === "cancelled";
    const project = event.status === "project";
    const title = eventTitle(event);
    const label = isEnglish() ? "View activity" : "Voir l'activité";
    const register = isEnglish() ? "I register" : "Je m'inscris";
    const interest = isEnglish() ? "Show interest" : "Manifester mon intérêt";
    return '<article class="calendar-card bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">' +
      '<div class="p-5 flex gap-4">' +
        (event.date ? '<div class="calendar-date bg-primary text-white rounded-xl px-3 py-2 text-center shrink-0"><span class="block text-xs uppercase">' + escapeHtml(formatShortDate(event.date).split(" ")[0]) + '</span><strong class="block text-2xl leading-none mt-1">' + escapeHtml(dateValue(event.date).getDate()) + '</strong></div>' : '<div class="calendar-date bg-secondary text-white rounded-xl px-3 py-2 text-center shrink-0"><span class="block text-xs uppercase">' + (isEnglish() ? "Coming" : "À venir") + '</span></div>') +
        '<div class="min-w-0 flex-1"><p class="text-sm text-gray-500 mb-1">' + eventDateLabel(event) + '</p><h3 class="text-xl font-semibold text-primary">' + title + '</h3>' + (event.subtitle ? '<p class="text-sm text-gray-600 mt-1">' + escapeHtml(event.subtitle) + '</p>' : '') + (event.eventType === "voyage" ? '<span class="inline-block mt-2 text-xs font-semibold uppercase tracking-wide text-secondary">' + (isEnglish() ? "Climbing & adventure trip" : "Voyage escalade & aventure") + '</span>' : '') + '</div>' +
      '</div>' +
      (event.image && !compact ? '<img src="' + escapeHtml(event.image) + '" alt="' + title + '" class="w-full h-48 object-cover" loading="lazy" decoding="async">' : '') +
      '<div class="px-5 pb-5 flex flex-col flex-1">' +
        '<div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">' +
          '<span><i class="ri-price-tag-3-line mr-1" aria-hidden="true"></i>' + categoryLabel(event.category) + '</span>' +
          (event.location ? '<span><i class="ri-map-pin-line mr-1" aria-hidden="true"></i>' + escapeHtml(event.location) + '</span>' : '') +
          (event.startTime ? '<span><i class="ri-time-line mr-1" aria-hidden="true"></i>' + escapeHtml(event.startTime) + (event.endTime ? '–' + escapeHtml(event.endTime) : '') + '</span>' : '') +
        '</div>' +
        (!compact && event.shortDescription ? '<p class="text-gray-600 mb-4">' + escapeHtml(isEnglish() ? (event.shortDescriptionEn || event.shortDescription) : event.shortDescription) + '</p>' : '') +
        '<div class="mt-auto flex flex-wrap items-center gap-3">' +
          (price(event) ? '<span class="font-semibold text-gray-900">' + price(event) + '</span>' : '') +
          (availability(event) ? '<span class="text-sm ' + (full ? 'text-red-700' : 'text-gray-600') + '">' + escapeHtml(availability(event)) + '</span>' : '') +
          '<button type="button" class="calendar-detail-btn ml-auto text-primary font-medium hover:text-secondary" data-event-id="' + escapeHtml(event.id) + '">' + label + '</button>' +
          (statusLabel(event) ? '<span class="text-sm ' + (project ? 'text-amber-700' : 'text-gray-600') + '">' + escapeHtml(statusLabel(event)) + '</span>' : '') +
          (cancelled || full ? '<span class="text-sm font-medium text-red-700">' + (cancelled ? (isEnglish() ? "Cancelled" : "Annulé") : (isEnglish() ? "Waiting list" : "Liste d'attente")) + '</span>' : project ? '<button type="button" class="calendar-interest-btn bg-secondary text-white px-4 py-2 rounded-button font-medium hover:bg-amber-600" data-event-id="' + escapeHtml(event.id) + '">' + interest + '</button>' : '<button type="button" class="calendar-register-btn bg-secondary text-white px-4 py-2 rounded-button font-medium hover:bg-amber-600" data-event-id="' + escapeHtml(event.id) + '">' + register + '</button>') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function setupFilters(events, container, list) {
    const categories = categoryOrder.filter(function (category) { return events.some(function (event) { return event.category === category; }); });
    container.innerHTML = categories.length ? '<button type="button" class="calendar-filter active px-4 py-2 rounded-full bg-primary text-white" data-category="all">' + (isEnglish() ? "All" : "Toutes") + '</button>' + categories.map(function (category) { return '<button type="button" class="calendar-filter px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200" data-category="' + category + '"><i class="' + categoryIcons[category] + ' mr-1" aria-hidden="true"></i>' + categoryLabel(category) + '</button>'; }).join("") : "";
    container.querySelectorAll(".calendar-filter").forEach(function (button) { button.addEventListener("click", function () { container.querySelectorAll(".calendar-filter").forEach(function (item) { item.classList.remove("active", "bg-primary", "text-white"); item.classList.add("bg-gray-100", "text-gray-700"); }); button.classList.add("active", "bg-primary", "text-white"); button.classList.remove("bg-gray-100", "text-gray-700"); renderList(events, list, button.dataset.category); renderMonth(events, button.dataset.category); }); });
  }

  function renderList(events, list, category) {
    const filtered = events.filter(function (event) { return !category || category === "all" || event.category === category; });
    list.innerHTML = filtered.length ? filtered.map(function (event) { return eventCard(event, false); }).join("") : '<div class="bg-gray-50 rounded-2xl p-8 text-center text-gray-600">' + (isEnglish() ? "No activities are published for this filter yet." : "Aucune activité n'est publiée dans ce filtre pour le moment.") + '</div>';
    bindEventButtons(list);
  }

  function dateIsInMonth(date) {
    return date && date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth();
  }

  function eventRanges(event) {
    const ranges = [];
    if (event.date) ranges.push({ start: event.date, end: event.endDate || event.date });
    (event.dateOptions || []).forEach(function (option) { ranges.push({ start: option.start, end: option.end || option.start }); });
    return ranges;
  }

  function eventOccursOn(event, date) {
    return eventRanges(event).some(function (range) {
      const start = dateValue(range.start);
      const end = dateValue(range.end);
      return start && end && date >= start && date <= end;
    });
  }

  function renderMonth(events, category) {
    const calendar = document.querySelector("[data-calendar-month]");
    const label = document.querySelector("[data-calendar-month-label]");
    if (!calendar || !label) return;
    const monthName = new Intl.DateTimeFormat(isEnglish() ? "en-GB" : "fr-FR", { month: "long", year: "numeric" }).format(currentMonth);
    label.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;
    const monthEvents = events.filter(function (event) {
      const hasDateInMonth = eventRanges(event).some(function (range) {
        const start = dateValue(range.start);
        const end = dateValue(range.end);
        return (dateIsInMonth(start) || dateIsInMonth(end) || (start && end && start < currentMonth && end >= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)));
      });
      return hasDateInMonth && (!category || category === "all" || event.category === category);
    });
    const weekdays = isEnglish() ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    let html = weekdays.map(function (day) { return '<div class="calendar-weekday text-xs font-semibold uppercase tracking-wide p-3">' + day + '</div>'; }).join("");
    for (let cell = 0; cell < offset + daysInMonth; cell += 1) {
      if (cell < offset) { html += '<div class="calendar-day-muted min-h-28"></div>'; continue; }
      const day = cell - offset + 1;
      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayEvents = monthEvents.filter(function (event) { return eventOccursOn(event, dayDate); });
      html += '<div class="calendar-day min-h-28 p-3"><strong class="text-sm text-primary">' + day + '</strong>' + dayEvents.map(function (event) { return '<button type="button" class="calendar-detail-btn block w-full text-left mt-2 p-2 rounded-lg bg-secondary/15 text-xs text-gray-800 hover:bg-secondary/30" data-event-id="' + escapeHtml(event.id) + '">' + eventTitle(event) + (event.startTime ? '<span class="block text-gray-600 mt-1">' + escapeHtml(event.startTime) + '</span>' : '') + '</button>'; }).join("") + '</div>';
    }
    calendar.innerHTML = html;
    bindEventButtons(calendar);
  }

  function bindEventButtons(scope) {
    scope.querySelectorAll(".calendar-detail-btn, .calendar-register-btn, .calendar-interest-btn").forEach(function (button) { button.addEventListener("click", function () { openModal(button.dataset.eventId, button.classList.contains("calendar-register-btn") || button.classList.contains("calendar-interest-btn")); }); });
  }

  function interestForm(event) {
    const dateOptions = event.dateOptions && event.dateOptions.length ? '<fieldset class="sm:col-span-2"><legend class="text-sm mb-2">' + (isEnglish() ? "Preferred dates" : "Période souhaitée") + '</legend><div class="flex flex-col gap-2">' + event.dateOptions.map(function (option) { return '<label><input type="radio" required name="date_preference" value="' + escapeHtml(option.label) + '"> ' + escapeHtml(option.label) + '</label>'; }).join("") + '<label><input type="radio" required name="date_preference" value="indifferent"> ' + (isEnglish() ? "Either period" : "Indifférent") + '</label></div></fieldset>' : "";
    return '<form id="eventInterestForm" action="https://formspree.io/f/mvganway" method="POST" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"><input type="hidden" name="type" value="interest"><input type="hidden" name="activite" value="' + escapeHtml(event.title) + '"><label class="text-sm">' + (isEnglish() ? "First name" : "Prénom") + '<input required name="prenom" type="text" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="given-name"></label><label class="text-sm">' + (isEnglish() ? "Last name" : "Nom") + '<input required name="nom" type="text" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="family-name"></label><label class="text-sm sm:col-span-2">Email<input required name="email" type="email" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="email"></label><label class="text-sm">' + (isEnglish() ? "Phone (optional)" : "Téléphone (facultatif)") + '<input name="telephone" type="tel" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="tel"></label>' + dateOptions + '<label class="text-sm sm:col-span-2">' + (isEnglish() ? "Message" : "Message") + '<textarea name="message" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg"></textarea></label><button type="submit" class="sm:col-span-2 bg-primary text-white px-5 py-3 rounded-button font-medium hover:bg-blue-700">' + (isEnglish() ? "Show interest" : "Manifester mon intérêt") + '</button></form>';
  }

  function openModal(id, registration) {
    const event = getEvents().find(function (item) { return item.id === id; });
    const modal = document.querySelector("#eventModal");
    if (!event || !modal) return;
    const full = event.status === "full" || event.placesAvailable === 0;
    modal.querySelector("[data-event-modal-content]").innerHTML = '<div class="flex justify-between gap-4 mb-5"><div><p class="text-sm text-gray-500">' + eventDateLabel(event) + (event.startTime ? ' · ' + escapeHtml(event.startTime) + (event.endTime ? '–' + escapeHtml(event.endTime) : '') : '') + '</p><h2 id="eventModalTitle" class="text-2xl font-bold text-primary mt-1">' + eventTitle(event) + '</h2></div><button type="button" data-close-modal class="text-gray-500 hover:text-primary text-2xl" aria-label="' + (isEnglish() ? "Close" : "Fermer") + '">&times;</button></div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-5">' + (event.location ? '<p><strong>' + (isEnglish() ? "Location" : "Lieu") + ':</strong> ' + escapeHtml(event.location) + '</p>' : '') + (event.level ? '<p><strong>' + (isEnglish() ? "Level" : "Niveau") + ':</strong> ' + escapeHtml(event.level) + '</p>' : '') + (event.duration ? '<p><strong>' + (isEnglish() ? "Duration" : "Durée") + ':</strong> ' + escapeHtml(event.duration) + '</p>' : '') + (price(event) ? '<p><strong>' + (event.priceLabel ? escapeHtml(event.priceLabel) : (isEnglish() ? "Price" : "Prix")) + ':</strong> ' + price(event) + '</p>' : '') + '</div>' +
      '<p class="text-gray-700 mb-5">' + eventDescription(event) + '</p>' + (event.includedNote ? '<p class="text-sm text-gray-600 mb-3"><strong>' + (isEnglish() ? "Included note" : "À noter") + ':</strong> ' + escapeHtml(event.includedNote) + '</p>' : '') + (event.notIncluded ? '<p class="text-sm text-gray-600 mb-5"><strong>' + (isEnglish() ? "Not included" : "À prévoir en plus") + ':</strong> ' + escapeHtml(event.notIncluded) + '</p>' : '') + '<p class="text-sm font-medium ' + (full ? 'text-red-700' : 'text-gray-600') + '">' + escapeHtml(availability(event)) + '</p>' +
      (event.status === "project" && event.interestForm ? interestForm(event) : (!full && event.status !== "cancelled" && event.status !== "project" ? '<form id="eventRegistrationForm" action="https://formspree.io/f/mvganway" method="POST" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"><input type="hidden" name="activite" value="' + escapeHtml(event.title) + '"><input type="hidden" name="date" value="' + escapeHtml(event.date || event.dateLabel) + '"><label class="text-sm">' + (isEnglish() ? "First name" : "Prénom") + '<input required name="prenom" type="text" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="given-name"></label><label class="text-sm">' + (isEnglish() ? "Last name" : "Nom") + '<input required name="nom" type="text" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="family-name"></label><label class="text-sm sm:col-span-2">Email<input required name="email" type="email" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="email"></label><label class="text-sm">' + (isEnglish() ? "Phone (optional)" : "Téléphone (facultatif)") + '<input name="telephone" type="tel" class="mt-1 w-full px-3 py-2 border rounded-lg" autocomplete="tel"></label><label class="text-sm">' + (isEnglish() ? "Participants" : "Participants") + '<input required min="1" name="participants" type="number" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-sm sm:col-span-2">' + (isEnglish() ? "Level / experience" : "Niveau / expérience") + '<input name="niveau" type="text" class="mt-1 w-full px-3 py-2 border rounded-lg"></label><label class="text-sm sm:col-span-2">' + (isEnglish() ? "Message" : "Message") + '<textarea name="message" rows="3" class="mt-1 w-full px-3 py-2 border rounded-lg"></textarea></label><button type="submit" class="sm:col-span-2 bg-primary text-white px-5 py-3 rounded-button font-medium hover:bg-blue-700">' + (isEnglish() ? "I register" : "Je m'inscris") + '</button></form>' : "")) +
      '<div class="flex flex-wrap gap-3 mt-6"><a class="text-primary underline" href="mailto:contact@verticalhorizons.ch?subject=' + encodeURIComponent(event.title) + '&body=' + encodeURIComponent((isEnglish() ? "Hello Guillermo, I would like to register for " : "Bonjour Guillermo, je souhaite m'inscrire à ") + event.title + " le " + (event.date || event.dateLabel) + ".") + '">' + (event.status === "project" ? (isEnglish() ? "Show interest by email" : "Manifester mon intérêt par email") : (isEnglish() ? "Register by email" : "S'inscrire par email")) + '</a>' + (window.VERTICAL_HORIZONS_WHATSAPP && event.status !== "project" ? '<a class="text-primary underline" target="_blank" rel="noopener noreferrer" href="https://wa.me/' + window.VERTICAL_HORIZONS_WHATSAPP + '?text=' + encodeURIComponent((isEnglish() ? "Hello Guillermo, I would like to register for " : "Bonjour Guillermo, je souhaiterais m'inscrire à ") + event.title + " le " + (event.date || event.dateLabel) + ".") + '">WhatsApp</a>' : "") + (event.date ? '<button type="button" class="text-primary underline" data-google-calendar="' + escapeHtml(event.id) + '">' + (isEnglish() ? "Add to Google Calendar" : "Ajouter à Google Calendar") + '</button><button type="button" class="text-primary underline" data-ics-calendar="' + escapeHtml(event.id) + '">' + (isEnglish() ? "Add to my calendar" : "Ajouter à mon calendrier") + '</button>' : '') + '</div>';
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    modal.querySelectorAll("[data-google-calendar]").forEach(function (button) { button.addEventListener("click", function () { downloadGoogle(event); }); });
    modal.querySelectorAll("[data-ics-calendar]").forEach(function (button) { button.addEventListener("click", function () { downloadIcs(event); }); });
    const form = modal.querySelector("#eventRegistrationForm, #eventInterestForm");
    if (form) form.addEventListener("submit", function () { setTimeout(closeModal, 1500); });
    if (registration && form) form.querySelector("input")?.focus();
  }

  function closeModal() { const modal = document.querySelector("#eventModal"); if (modal) { modal.hidden = true; modal.setAttribute("aria-hidden", "true"); } }

  function calendarDates(event) {
    const start = (event.date + "T" + (event.startTime || "09:00") + ":00").replace(/[-:]/g, "");
    const endDate = event.endDate || event.date;
    const end = (endDate + "T" + (event.endTime || event.startTime || "10:00") + ":00").replace(/[-:]/g, "");
    return { start: start, end: end };
  }

  function downloadGoogle(event) { const dates = calendarDates(event); const url = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(event.title) + "&dates=" + dates.start + "/" + dates.end + "&location=" + encodeURIComponent(event.location || "") + "&details=" + encodeURIComponent(event.description || ""); window.open(url, "_blank", "noopener"); }

  function downloadIcs(event) { const dates = calendarDates(event); const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Vertical Horizons//Calendar//FR", "BEGIN:VEVENT", "UID:" + event.id + "@verticalhorizons.ch", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"), "DTSTART;TZID=Europe/Zurich:" + dates.start, "DTEND;TZID=Europe/Zurich:" + dates.end, "SUMMARY:" + event.title, "LOCATION:" + (event.location || ""), "DESCRIPTION:" + (event.description || ""), "END:VEVENT", "END:VCALENDAR"].join("\r\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" })); link.download = event.id + ".ics"; link.click(); URL.revokeObjectURL(link.href); }

  function renderCalendarPage() {
    const events = getEvents();
    const upcoming = events.filter(function (event) { return !event.date || dateValue(event.date) >= today; });
    const filters = document.querySelector("[data-calendar-filters]");
    const list = document.querySelector("[data-calendar-list]");
    if (!filters || !list) return;
    setupFilters(upcoming, filters, list);
    renderList(upcoming, list, "all");
    renderMonth(upcoming, "all");
    document.querySelector("[data-calendar-prev]")?.addEventListener("click", function () { currentMonth.setMonth(currentMonth.getMonth() - 1); renderMonth(upcoming, "all"); });
    document.querySelector("[data-calendar-next]")?.addEventListener("click", function () { currentMonth.setMonth(currentMonth.getMonth() + 1); renderMonth(upcoming, "all"); });
    const past = document.querySelector("[data-calendar-past]");
    if (past) { const pastEvents = events.filter(function (event) { return dateValue(event.date) < today || event.status === "completed"; }); past.innerHTML = pastEvents.length ? pastEvents.map(function (event) { return eventCard(event, true); }).join("") : '<p class="text-gray-600">' + (isEnglish() ? "No past activities are listed." : "Aucune activité passée n'est listée.") + '</p>'; }
  }

  function renderHome() {
    const list = document.querySelector("[data-upcoming-events]");
    if (!list) return;
    const events = getEvents().filter(function (event) { return dateValue(event.date) >= today && event.status === "upcoming"; }).slice(0, 4);
    list.innerHTML = events.length ? events.map(function (event) { return eventCard(event, true); }).join("") : '<div class="bg-gray-50 rounded-2xl p-6 text-center text-gray-600">' + (isEnglish() ? "New activity dates will be published soon." : "Les prochaines dates seront publiées prochainement.") + '</div>';
    bindEventButtons(list);
  }

  function refresh() { renderCalendarPage(); renderHome(); }
  document.addEventListener("DOMContentLoaded", function () { refresh(); document.querySelectorAll(".language-btn").forEach(function (button) { button.addEventListener("click", function () { setTimeout(refresh, 0); }); }); document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeModal(); }); document.querySelector("#eventModal")?.addEventListener("click", function (event) { if (event.target === event.currentTarget) closeModal(); }); });
})();
