# 🎬 Show Night Planner

Mini front-end React + TypeScript pour planifier ta soirée série :
recherche via l'API **TVMaze** (gratuite, sans clé), watchlist sauvegardée
en localStorage, tri configurable, notifications, undo.

# 🎬 Show Night Planner
## Team 
Anthony Lopes - Thomas Sauvage

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

### 3. Strategy — `SortStrategy` + `RecommendationStrategy`
**Problème** : (a) 4 façons de trier la même liste (note, date, durée,
nom) ; (b) plusieurs façons de recommander des shows (top-rated,
correspondance de genres avec la watchlist, mode auto). Un `switch`
dans le composant mélange UI et logique métier, et complique l'ajout
d'un nouveau critère.

**Solution** : chaque stratégie est un objet `{ id, label, sort | recommend }`
exporté. Les composants ne savent pas *comment* trier ou recommander, ils
reçoivent une stratégie et appellent sa méthode.

**Pourquoi** : ajouter "Trier par langue" ou "Recommander aléatoirement" =
un objet de 5 lignes dans le fichier strategy, zéro modif dans l'UI.
La recommandation `auto` délègue à `topRated` ou `genreMatch` selon
l'état de la watchlist — composition naturelle entre stratégies.

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
