# 🎬 Show Night Planner

Mini front-end React + TypeScript pour planifier ta soirée série :
recherche via l'API **TVMaze** (gratuite, sans clé), watchlist sauvegardée
en localStorage, tri configurable, notifications, undo.

## Stack

- React 18 + TypeScript
- Vite
- API : [TVMaze](https://www.tvmaze.com/api) — pas de clé requise

## Démarrer

```bash
npm install
npm run dev
# build prod : npm run build
```

## Architecture des patterns

Tous les patterns vivent dans `src/patterns/<pattern>/<Nom>.ts`,
isolés des composants React. Les hooks (`src/hooks/`) jouent le rôle
d'adaptateur entre les patterns (purs TS, testables hors React) et l'UI.

```
src/
├── patterns/
│   ├── facade/TVMazeService.ts
│   ├── repository/WatchlistRepository.ts
│   ├── strategy/SortStrategy.ts
│   ├── observer/NotificationCenter.ts
│   ├── factory/NotificationFactory.ts
│   └── command/WatchlistCommand.ts
├── hooks/
│   ├── useWatchlist.ts        # bridge Command + Repository → React
│   └── useNotifications.ts    # bridge Observer → React
└── components/                # React, pas de logique métier
```

---

## Brief des patterns

### 1. Facade — `TVMazeService`
**Problème** : l'API TVMaze renvoie du JSON brut avec des résumés HTML, des
champs imbriqués (`image.medium`), des nullables partout. Si chaque
composant fait son propre `fetch` + nettoyage, on duplique et on couple
toute l'UI au format de l'API.

**Solution** : une seule classe `TVMazeService` expose deux méthodes
simples (`search`, `getById`) qui renvoient le type `Show` propre du
domaine. Le reste de l'app ignore l'existence de TVMaze.

**Pourquoi** : changer d'API (TMDB, OMDB) ne touche qu'un fichier.

---

### 2. Repository — `WatchlistRepository`
**Problème** : la watchlist doit survivre au refresh, donc localStorage.
Mais `JSON.parse(localStorage.getItem(...))` éparpillé dans les composants
= bugs (clé qui change, parse qui crash, tests impossibles).

**Solution** : interface `IWatchlistRepository` avec une implémentation
`LocalStorageWatchlistRepository`. Les commandes prennent l'interface,
pas l'implémentation.

**Pourquoi** : on pourrait remplacer par une implémentation in-memory
pour les tests, ou un `IndexedDBWatchlistRepository` plus tard, sans
toucher au reste.

---

### 3. Strategy — `SortStrategy`
**Problème** : 4 façons de trier la même liste (note, date, durée, nom).
Faire un gros `switch` dans le composant `Watchlist` mélange UI et logique
de tri, et complique l'ajout d'un nouveau critère.

**Solution** : chaque stratégie est un objet `{ id, label, sort }` exporté.
Le composant ne sait pas comment trier, il reçoit une `SortStrategy` et
appelle `.sort()`.

**Pourquoi** : ajouter "Trier par langue" = un objet de 5 lignes dans
`SortStrategy.ts`, zéro modif dans l'UI.

---

### 4. Observer — `NotificationCenter`
**Problème** : les notifications sont déclenchées depuis plusieurs
endroits (commandes Add/Remove, erreur d'API dans le composant racine).
Passer un callback `onNotify` à chaque appel = couplage fort, prop
drilling.

**Solution** : un `NotificationCenter` global (singleton) avec
`subscribe`/`publish`. Le hook `useNotifications` s'abonne et expose
les notifs à React.

**Pourquoi** : n'importe quelle partie du code peut émettre une notif
sans connaître l'UI. Les composants restent découplés.

---

### 5. Factory — `NotificationFactory`
**Problème** : sans factory, chaque émetteur écrit son objet `Notification`
à la main → titres incohérents, IDs oubliés, `createdAt` parfois absent.

**Solution** : `NotificationFactory.added(name)`, `.removed(name)`,
`.duplicate(name)`, `.error(msg)` construisent des objets bien formés et
typés (kind discriminant pour le styling CSS).

**Pourquoi** : pair naturel de l'Observer. Le code appelant exprime
l'*intention* (`added`), pas la *forme* de la notif.

---

### 6. Command — `AddShowCommand`, `RemoveShowCommand`, `CommandHistory`
**Problème** : on veut un bouton **Undo** sur la dernière action de la
watchlist. Garder une copie du state avant chaque action = fragile, et
ne se mappe pas à "annule juste *cette* action".

**Solution** : chaque action est une `Command` avec `execute()` /
`undo()`. La commande capture le state nécessaire à l'inversion
(le show retiré, ou le flag "était déjà présent"). `CommandHistory`
empile les commandes exécutées.

**Pourquoi** : Undo devient trivial, et l'historique pourrait être
étendu à un redo, un journal d'actions, ou rejoué pour tester.

---

## Patterns volontairement **non** utilisés

L'énoncé évalue aussi le fait de justifier l'absence d'un pattern.

### Decorator
Tentation : enrichir un `Show` avec des badges calculés ("Long
format", "Top rated", "Nouveau"). Pas retenu : un simple helper
`computeBadges(show): string[]` fait le job. Empiler des classes
décoratrices pour une dérivation pure d'attributs = sur-ingénierie pour
ce projet — la complexité ajoutée dépasse le bénéfice.

### Singleton (explicite)
On exporte `tvMazeService`, `watchlistRepository`, `notificationCenter`
comme instances uniques. C'est *de facto* un singleton, mais sans la
cérémonie (classe privée, `getInstance()`). En TypeScript + ES modules,
un `export const` partagé est l'idiome naturel ; ajouter le boilerplate
GoF n'apporterait rien.

### Adapter
Le `TVMazeService` *fait* de l'adaptation (raw API → type `Show`), mais
on l'appelle Facade parce que son rôle premier est de simplifier
*plusieurs* opérations sous une API unique. L'Adapter classique aurait
été pertinent si on devait faire cohabiter deux APIs (TVMaze + OMDB)
derrière la même interface — pas le cas ici.

### State
Le state global (résultats, watchlist, tri sélectionné) tient dans 3
`useState` + un hook. Introduire une machine à états ou un store
(Zustand, Redux) pour 4 transitions = bruit inutile. React gère.

### Builder
Aucun objet ne nécessite une construction multi-étapes complexe. Les
shows viennent déjà formés de la Facade, les notifications passent par
la Factory. Un Builder ici serait une solution sans problème.

---

## Mapping pattern ↔ fichier (pour l'oral)

| Pattern    | Fichier                                              | Lignes clés                  |
|------------|------------------------------------------------------|------------------------------|
| Facade     | `src/patterns/facade/TVMazeService.ts`               | classe `TVMazeService`       |
| Repository | `src/patterns/repository/WatchlistRepository.ts`     | interface + impl localStorage|
| Strategy   | `src/patterns/strategy/SortStrategy.ts`              | `SORT_STRATEGIES`            |
| Observer   | `src/patterns/observer/NotificationCenter.ts`        | `subscribe`/`publish`        |
| Factory    | `src/patterns/factory/NotificationFactory.ts`        | méthodes `added`/`removed`/… |
| Command    | `src/patterns/command/WatchlistCommand.ts`           | `execute`/`undo`/`CommandHistory` |

6 patterns, 1 minimum dépassé d'un cran — marge confortable pour la
soutenance si l'un d'eux est contesté.
