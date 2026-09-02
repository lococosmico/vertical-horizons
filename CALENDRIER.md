# Calendrier Vertical Horizons

Les activites publiees sont stockees dans `data/events.js`. La page `calendrier/index.html` et la section de la Home utilisent automatiquement la meme source.

## Activites du dimanche

Les activites du dimanche sont enregistrees individuellement dans `events` afin de respecter les vacances scolaires vaudoises, les voyages, la meteo et les changements de programme.

Pour 2026-2027, aucune activite reguliere du dimanche n'est programmee pendant les vacances d'automne (10-25 octobre 2026), de Noel (24 decembre 2026-10 janvier 2027), les relaches (6-14 fevrier 2027) ou Paques (26 mars-11 avril 2027).

## Ajouter une activite ponctuelle

Dans `events`, ajouter un objet avec au minimum:

```js
{
  id: "escalade-tete-2027-07-04",
  date: "2027-07-04",
  title: "Escalade en tete",
  category: "escalade",
  eventType: "activity",
  location: "Lieu a confirmer",
  shortDescription: "Une seance pour progresser vers plus d'autonomie.",
  description: "Description complete de l'activite.",
  price: "CHF 180",
  status: "upcoming",
  featured: true
}
```

Les categories disponibles sont `escalade`, `corde`, `entrainement`, `yoga`, `grande-voie`, `voyage` et `groupes`. Utiliser `eventType: "voyage"` pour differencier visuellement un voyage. Les statuts disponibles sont `upcoming`, `project`, `full`, `cancelled`, `completed` et `hidden`.

## Voyages et dates multiples

Pour un voyage avec plusieurs periodes possibles, utiliser `dateOptions` avec `start`, `end` et `label`, puis `dateStatus: "to-confirm"`. Pour un voyage confirme sur plusieurs jours, utiliser `date`, `endDate` et `dateLabel`.

Les champs `priceLabel`, `notIncluded` et `estimatedAdditionalCosts` permettent de distinguer l'encadrement Vertical Horizons des frais de voyage restant a la charge du participant.

## Activites recurrentes

Les programmes recurrents sont dans `recurringTemplates`. Pour en ajouter ou en modifier un, renseigner `startDate`, les horaires, le lieu, le prix si necessaire et `recurring.weekday`: `0` dimanche, `2` mardi ou `4` jeudi. Sans `endDate`, le site genere automatiquement les six prochains mois. Pour arreter une serie, mettre `status: "hidden"`.

## Meteo et securite

Pour une activite exterieure, utiliser `weatherDependent: true`, une description et un lieu flexibles. Les mentions detaillees sont affichees dans la fiche de l'activite.

## Inscription et newsletter

Les inscriptions aux activites ouvertes utilisent le formulaire Formspree existant et ne stockent aucune donnee personnelle dans le depot. Les voyages en projet avec `interestForm: true` proposent un formulaire de manifestation d'interet, avec choix de periode lorsque plusieurs dates existent. Le formulaire newsletter est volontairement non connecte: il faut choisir un fournisseur, obtenir ses identifiants et remplacer le gestionnaire du formulaire avant de collecter des abonnements.
