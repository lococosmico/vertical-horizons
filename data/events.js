/*
 * Programme Vertical Horizons
 *
 * Keep one-off Sunday activities as individual events so school holidays,
 * trips, weather and programme changes can be managed without exceptions in
 * the calendar code. Tuesday and Thursday programmes remain recurring.
 */
window.VERTICAL_HORIZONS_EVENTS = {
  schoolBreaks: [
    { start: "2026-10-10", end: "2026-10-25", label: "Vacances d'automne" },
    { start: "2026-12-24", end: "2027-01-10", label: "Vacances de Noël" },
    { start: "2027-02-06", end: "2027-02-14", label: "Relâches" },
    { start: "2027-03-26", end: "2027-04-11", label: "Vacances de Pâques" }
  ],
  events: [
    {
      id: "technique-tactique-2026-09-13",
      date: "2026-09-13",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Observer, comprendre, expérimenter et progresser selon ses propres besoins.",
      description: "Une journée de progression en petit groupe pour observer et analyser sa pratique, identifier ses points forts et ses axes de progression, puis expérimenter des solutions adaptées. Le contenu peut inclure le placement, l'équilibre, l'utilisation des pieds, la lecture de voie, la gestion de l'effort et la tactique d'ascension, selon le niveau et les objectifs du groupe.",
      weatherDependent: true,
      safetyNote: "Le lieu et le contenu peuvent être adaptés en fonction de la météo, des conditions de la roche et du niveau du groupe.",
      status: "upcoming",
      featured: true
    },
    {
      id: "manipulations-corde-2026-09-20",
      date: "2026-09-20",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers adaptés à chacun pour revoir, comprendre et maîtriser les manipulations de corde.",
      description: "Chaque participant travaille à son propre niveau. Les ateliers peuvent porter sur l'installation d'un relais, les relais pour moulinette ou grimpe en tête / lead, la récupération du matériel, la gestion de la corde, le rappel, la progression en grande voie, l'assurage dynamique et d'autres manipulations selon les besoins.",
      weatherDependent: true,
      safetyNote: "Le programme et le lieu peuvent être adaptés en fonction des conditions météorologiques et des conditions de sécurité.",
      status: "upcoming",
      featured: true
    },
    {
      id: "technique-evolution-2026-09-27",
      date: "2026-09-27",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Un suivi pour analyser les progrès, approfondir les points faibles et construire la suite.",
      description: "Une séance orientée vers le suivi de la progression individuelle: analyser les progrès, approfondir les points faibles, poursuivre le travail technique, développer de nouvelles compétences et travailler la tactique. Il est possible de participer à une seule séance sans obligation de suivre tout le cycle.",
      weatherDependent: true,
      safetyNote: "Le lieu et le contenu peuvent être adaptés en fonction des conditions et du niveau du groupe.",
      status: "upcoming",
      featured: true
    },
    {
      id: "grande-voie-2026-10-04",
      date: "2026-10-04",
      title: "Grande voie",
      subtitle: "Sortie guidée & adaptée au niveau",
      category: "grande-voie",
      eventType: "activity",
      location: "Leysin",
      shortDescription: "Une journée pour mettre en pratique les compétences travaillées lors des ateliers de corde.",
      description: "Une journée de grande voie adaptée au niveau et à l'expérience du groupe. Elle permet notamment de mettre en pratique la préparation de la voie, l'organisation du matériel, la progression, la gestion des relais, la communication et l'assurage.",
      weatherDependent: true,
      safetyNote: "La voie et le lieu seront choisis en fonction de la météo, des conditions et du niveau du groupe.",
      status: "upcoming",
      featured: true
    },
    {
      id: "el-chorro-2026",
      dateOptions: [
        { start: "2026-10-12", end: "2026-10-16", label: "12–16 octobre 2026" },
        { start: "2026-10-19", end: "2026-10-23", label: "19–23 octobre 2026" }
      ],
      dateStatus: "to-confirm",
      title: "El Chorro – Climbing & Adventure",
      subtitle: "Dates à confirmer",
      category: "voyage",
      eventType: "voyage",
      location: "El Chorro, Andalousie",
      shortDescription: "5 jours d'escalade, de formation et d'aventure en Andalousie.",
      description: "Le programme principal peut inclure escalade sportive, technique et tactique, manipulations de corde, grande voie, rappel, via ferrata et découverte du secteur. Des activités complémentaires pourront être proposées selon les conditions, les disponibilités et les souhaits du groupe. Une estimation des coûts sera communiquée avant le séjour.",
      price: "CHF 750 / participant",
      priceLabel: "Encadrement Vertical Horizons",
      notIncluded: "Vol, transport jusqu'à Málaga, location de voiture, hébergement, repas, location éventuelle de matériel et activités complémentaires.",
      estimatedAdditionalCosts: { flights: null, accommodation: null, transport: null, equipment: null, activities: null },
      weatherDependent: true,
      safetyNote: "Le programme pourra être adapté en fonction de la météo, des conditions de la roche et des possibilités locales.",
      interestForm: true,
      status: "project"
    },
    {
      id: "todra-2027-01-04",
      date: "2027-01-04",
      endDate: "2027-01-09",
      dateLabel: "4–9 janvier 2027",
      title: "Todra – Morocco Climbing & Adventure",
      subtitle: "6 jours",
      category: "voyage",
      eventType: "voyage",
      location: "Gorges du Todra, Maroc",
      shortDescription: "Séjour escalade et aventure dans les Gorges du Todra et leurs environs.",
      description: "Le programme principal peut inclure escalade, découverte des Gorges du Todra, progression et technique, avec des sorties adaptées au niveau du groupe. D'autres activités et excursions pourront être proposées selon les conditions, les possibilités locales et les envies du groupe.",
      price: "CHF 1'000 / participant",
      priceLabel: "Encadrement Vertical Horizons",
      notIncluded: "Vol, transport, hébergement, éventuelle location de matériel, dépenses personnelles et activités supplémentaires éventuelles.",
      includedNote: "Selon l'hébergement choisi, une grande partie des repas peut être comprise dans le prix du séjour.",
      estimatedAdditionalCosts: { flights: null, accommodation: null, transport: null, equipment: null, activities: null },
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "costa-blanca-fevrier-2027",
      dateLabel: "Vacances de février 2027",
      title: "Costa Blanca – Winter Climbing",
      subtitle: "Projet",
      category: "voyage",
      eventType: "voyage",
      shortDescription: "Séjour escalade au soleil sur la Costa Blanca.",
      description: "Les informations détaillées seront publiées lorsque le projet sera confirmé.",
      status: "project",
      interestForm: true
    },
    {
      id: "leonidio-paques-2027",
      dateLabel: "Vacances de Pâques 2027",
      title: "Leonidio – Mediterranean Climbing",
      subtitle: "Projet",
      category: "voyage",
      eventType: "voyage",
      shortDescription: "Séjour escalade et aventure à Leonidio, en Grèce.",
      description: "Les informations détaillées seront publiées lorsque le projet sera confirmé.",
      status: "project",
      interestForm: true
    },
    {
      id: "technique-tactique-2026-11-01",
      date: "2026-11-01",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Observer, comprendre, expérimenter et progresser selon ses propres besoins.",
      description: "Une journée de progression en petit groupe basée sur l'auto-analyse et l'expérimentation de solutions adaptées.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "manipulations-corde-2026-11-08",
      date: "2026-11-08",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers adaptés à chacun pour revoir et maîtriser les manipulations de corde.",
      description: "Des ateliers personnalisés selon le niveau, l'expérience et les objectifs du groupe.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-evolution-2026-11-15",
      date: "2026-11-15",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Poursuivre le travail technique et suivre l'évolution individuelle.",
      description: "Une séance de suivi pour approfondir les points faibles et construire une progression cohérente.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "grande-voie-2026-11-22",
      date: "2026-11-22",
      title: "Grande voie",
      subtitle: "Sortie guidée & adaptée au niveau",
      category: "grande-voie",
      eventType: "activity",
      location: "Secteur adapté aux conditions",
      shortDescription: "Une sortie guidée choisie selon la météo et le niveau du groupe.",
      description: "Une journée de grande voie adaptée au niveau et à l'expérience du groupe.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-tactique-2026-11-29",
      date: "2026-11-29",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Une journée de progression en petit groupe.",
      description: "Une séance basée sur l'observation, l'analyse et l'expérimentation.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "manipulations-corde-2026-12-06",
      date: "2026-12-06",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers personnalisés selon les besoins du groupe.",
      description: "Des ateliers de manipulations de corde adaptés au niveau de chaque participant.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-evolution-2026-12-13",
      date: "2026-12-13",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Suivre les progrès et approfondir les axes de travail.",
      description: "Une séance de suivi orientée vers une progression cohérente.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "grande-voie-2026-12-20",
      date: "2026-12-20",
      title: "Grande voie",
      subtitle: "Sortie guidée & adaptée au niveau",
      category: "grande-voie",
      eventType: "activity",
      location: "Secteur adapté aux conditions",
      shortDescription: "Une sortie guidée adaptée à la météo et au niveau du groupe.",
      description: "Une journée de grande voie avec une voie et un secteur choisis selon les conditions.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-tactique-2027-01-17",
      date: "2027-01-17",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Observer, comprendre, expérimenter et progresser.",
      description: "Une séance de progression en petit groupe basée sur l'auto-analyse.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "manipulations-corde-2027-01-24",
      date: "2027-01-24",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers personnalisés selon le niveau du groupe.",
      description: "Des ateliers adaptés à chacun pour revoir et maîtriser les manipulations de corde.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-evolution-2027-01-31",
      date: "2027-01-31",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Poursuivre le travail technique et suivre l'évolution individuelle.",
      description: "Une séance de suivi pour construire une progression cohérente.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "grande-voie-2027-02-21",
      date: "2027-02-21",
      title: "Grande voie",
      subtitle: "Sortie guidée & adaptée au niveau",
      category: "grande-voie",
      eventType: "activity",
      location: "Secteur adapté aux conditions",
      shortDescription: "Une sortie guidée choisie selon la météo et le niveau du groupe.",
      description: "Une journée de grande voie adaptée au niveau et aux conditions.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-tactique-2027-02-28",
      date: "2027-02-28",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Observer, comprendre, expérimenter et progresser.",
      description: "Une séance basée sur l'observation, l'analyse et l'expérimentation.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "manipulations-corde-2027-03-07",
      date: "2027-03-07",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers personnalisés selon les besoins du groupe.",
      description: "Des ateliers de manipulations de corde adaptés au niveau de chaque participant.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-evolution-2027-03-14",
      date: "2027-03-14",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Suivre les progrès et approfondir les axes de travail.",
      description: "Une séance de suivi orientée vers une progression cohérente.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "grande-voie-2027-03-21",
      date: "2027-03-21",
      title: "Grande voie",
      subtitle: "Sortie guidée & adaptée au niveau",
      category: "grande-voie",
      eventType: "activity",
      location: "Secteur adapté aux conditions",
      shortDescription: "Une sortie guidée adaptée à la météo et au niveau du groupe.",
      description: "Une journée de grande voie avec une voie et un secteur choisis selon les conditions.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-tactique-2027-04-18",
      date: "2027-04-18",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Observer, comprendre, expérimenter et progresser.",
      description: "Une séance de progression en petit groupe basée sur l'auto-analyse.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "manipulations-corde-2027-04-25",
      date: "2027-04-25",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers personnalisés selon les besoins du groupe.",
      description: "Des ateliers de manipulations de corde adaptés au niveau de chaque participant.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-evolution-2027-05-02",
      date: "2027-05-02",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Suivre les progrès et approfondir les axes de travail.",
      description: "Une séance de suivi orientée vers une progression cohérente.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "grande-voie-2027-05-09",
      date: "2027-05-09",
      title: "Grande voie",
      subtitle: "Sortie guidée & adaptée au niveau",
      category: "grande-voie",
      eventType: "activity",
      location: "Secteur adapté aux conditions",
      shortDescription: "Une sortie guidée adaptée à la météo et au niveau du groupe.",
      description: "Une journée de grande voie avec une voie et un secteur choisis selon les conditions.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-tactique-2027-05-16",
      date: "2027-05-16",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Observer, comprendre, expérimenter et progresser.",
      description: "Une séance de progression en petit groupe basée sur l'auto-analyse.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "manipulations-corde-2027-05-23",
      date: "2027-05-23",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers personnalisés selon le niveau du groupe.",
      description: "Des ateliers adaptés à chacun pour revoir et maîtriser les manipulations de corde.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-evolution-2027-05-30",
      date: "2027-05-30",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Poursuivre le travail technique et suivre l'évolution individuelle.",
      description: "Une séance de suivi pour construire une progression cohérente.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "grande-voie-2027-06-06",
      date: "2027-06-06",
      title: "Grande voie",
      subtitle: "Sortie guidée & adaptée au niveau",
      category: "grande-voie",
      eventType: "activity",
      location: "Secteur adapté aux conditions",
      shortDescription: "Une sortie guidée choisie selon la météo et le niveau du groupe.",
      description: "Une journée de grande voie adaptée au niveau et aux conditions.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-tactique-2027-06-13",
      date: "2027-06-13",
      title: "Technique & tactique d'escalade",
      subtitle: "Auto-analyse & progression individuelle",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Observer, comprendre, expérimenter et progresser.",
      description: "Une séance de progression en petit groupe basée sur l'auto-analyse.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "manipulations-corde-2027-06-20",
      date: "2027-06-20",
      title: "Manipulations de corde",
      subtitle: "Ateliers techniques adaptés à votre niveau",
      category: "corde",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Des ateliers personnalisés selon les besoins du groupe.",
      description: "Des ateliers de manipulations de corde adaptés au niveau de chaque participant.",
      weatherDependent: true,
      status: "upcoming"
    },
    {
      id: "technique-evolution-2027-06-27",
      date: "2027-06-27",
      title: "Technique & évolution",
      subtitle: "Suivi personnalisé",
      category: "escalade",
      eventType: "activity",
      location: "Lieu adapté aux conditions",
      shortDescription: "Suivre les progrès et approfondir les axes de travail.",
      description: "Une séance de suivi orientée vers une progression cohérente.",
      weatherDependent: true,
      status: "upcoming"
    }
  ],
  recurringTemplates: [
    {
      id: "entrainement-escalade-mardi",
      startDate: "2026-09-01",
      title: "Coaching / entraînement escalade",
      subtitle: "Groupe de progression suivi",
      category: "entrainement",
      eventType: "activity",
      startTime: "17:00",
      endTime: "19:00",
      location: "Villeneuve - voie / bloc indoor ou Monthey - bloc indoor",
      shortDescription: "Un entraînement suivi structuré autour d'un cycle de progression.",
      description: "Une séance d'entraînement en groupe structurée autour d'un cycle de progression: force, puissance, endurance, résistance, technique, mobilité, préparation physique, travail spécifique bloc ou voie, prévention et stratégie d'entraînement. Des tarifs préférentiels sont proposés pour les personnes souhaitant suivre le programme sur un trimestre ou une année. Conditions et tarifs sur demande.",
      price: "CHF 40 / 2 heures",
      recurring: { frequency: "weekly", weekday: 2 },
      skipSchoolBreaks: true,
      status: "upcoming",
      featured: true
    },
    {
      id: "hatha-yoga-jeudi-ollon",
      startDate: "2026-09-03",
      title: "Hatha Yoga - Ollon",
      subtitle: "Cours général accessible à tous",
      category: "yoga",
      eventType: "activity",
      startTime: "18:00",
      endTime: "19:00",
      location: "Ollon",
      shortDescription: "Un cours général de Hatha Yoga, particulièrement pertinent pour les grimpeurs.",
      description: "Cours de Hatha Yoga accessible à tous. La pratique travaille la mobilité, la souplesse, la force, l'équilibre, la respiration, la concentration, la conscience corporelle, la récupération et le contrôle du mouvement.",
      price: "CHF 20 / séance",
      recurring: { frequency: "weekly", weekday: 4 },
      skipSchoolBreaks: true,
      status: "upcoming",
      featured: true
    }
  ]
};

/* Shared copy keeps the repeated Sunday cycle consistent without fixing the
 * outdoor programme to a single technical itinerary. */
(function (data) {
  const sundayCopy = {
    "Technique & tactique d'escalade": {
      shortDescription: "Observer, comprendre, expérimenter et progresser selon ses propres besoins.",
      description: "Une journée consacrée à l'observation et à l'auto-analyse de sa pratique. L'objectif est d'identifier ses points forts, ses difficultés et ses axes de progression, puis d'expérimenter des solutions concrètes adaptées à chacun. Le travail peut porter sur le mouvement, le placement, l'équilibre, l'utilisation des pieds, la lecture de voie, la gestion de l'effort ou encore la tactique d'ascension. Le contenu est adapté au niveau, aux objectifs et aux besoins du groupe.",
      safetyNote: "Le lieu et le contenu peuvent être adaptés en fonction de la météo, des conditions de la roche et du niveau du groupe."
    },
    "Manipulations de corde": {
      shortDescription: "Des ateliers adaptés à chacun pour revoir, comprendre et maîtriser les manipulations de corde.",
      description: "Une journée d'ateliers pratiques pour revoir et approfondir les manipulations de corde, chacun à son propre niveau. Selon les besoins du groupe, les ateliers peuvent notamment porter sur l'installation d'un relais pour moulinette ou grimpe en tête, la récupération du matériel, la gestion de la corde, le rappel, l'assurage dynamique, ainsi que différentes situations rencontrées en grande voie. L'objectif est de comprendre les systèmes, de gagner en autonomie et de pouvoir les réaliser de manière claire et efficace.",
      safetyNote: "Les exercices, le lieu et les manipulations proposées sont adaptés au niveau des participants et aux conditions de sécurité."
    },
    "Technique & évolution": {
      shortDescription: "Un suivi pour analyser les progrès, approfondir les points de travail et construire la suite.",
      description: "Une séance dans la continuité du travail réalisé précédemment, avec un suivi personnalisé de la progression. À partir des observations et des expériences réalisées, nous revenons sur les progrès, les difficultés rencontrées et les points à approfondir. Le travail peut évoluer vers de nouveaux mouvements, la lecture et la tactique, la gestion de l'effort ou d'autres aspects spécifiques aux objectifs de chacun.",
      safetyNote: "Le lieu et le contenu peuvent être adaptés en fonction des conditions, du niveau et des objectifs du groupe."
    },
    "Grande voie": {
      shortDescription: "Une journée pour mettre en pratique les compétences travaillées lors des ateliers de corde.",
      description: "Une sortie en grande voie choisie et adaptée au niveau, à l'expérience et aux objectifs du groupe. La journée permet de mettre en pratique les compétences travaillées lors des ateliers de corde: préparation de la voie, organisation du matériel, progression, communication, gestion des relais et assurage. Des rappels ou d'autres techniques de descente peuvent être intégrés selon l'itinéraire choisi.",
      safetyNote: "La voie et le secteur seront choisis en fonction de la météo, des conditions, du niveau et de l'expérience du groupe."
    }
  };
  data.events.forEach(function (event) {
    if (event.eventType === "activity" && sundayCopy[event.title]) Object.assign(event, sundayCopy[event.title]);
  });
  const elChorro = data.events.find(function (event) { return event.id === "el-chorro-2026"; });
  if (elChorro) {
    elChorro.description = "Un séjour de 5 jours consacré à l'escalade et à la découverte du secteur d'El Chorro. Le programme pourra inclure de l'escalade sportive, une journée consacrée aux manipulations et à la sécurité, une sortie en grande voie avec rappel, ainsi qu'une via ferrata. Selon les conditions, les disponibilités et les envies du groupe, d'autres activités pourront être proposées, par exemple le Caminito del Rey ou une découverte de la région. Le programme restera volontairement flexible afin de profiter au mieux des conditions locales et du niveau du groupe.";
    elChorro.notIncluded = "Vol et transport jusqu'à Málaga, location de voiture, hébergement, repas, location éventuelle de matériel et activités complémentaires.";
    elChorro.includedNote = "Selon l'hébergement choisi, les repas peuvent être préparés sur place ou pris dans les restaurants et commerces à proximité. Le matériel d'escalade peut également être loué sur place.";
    elChorro.safetyNote = "Le programme, les secteurs et les activités pourront être adaptés ou remplacés en fonction de la météo, des conditions locales, des disponibilités et des exigences de sécurité.";
  }
  const todra = data.events.find(function (event) { return event.id === "todra-2027-01-04"; });
  if (todra) todra.includedNote = "Selon l'hébergement choisi, une partie des repas peut être comprise dans le séjour. Cette information dépend de l'hébergement retenu et sert uniquement d'aide au budget.";
})(window.VERTICAL_HORIZONS_EVENTS);
