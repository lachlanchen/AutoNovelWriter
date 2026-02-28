[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/figs/banner.png" alt="Bannière LazyingArt" />
</p>

# AutoNovelWriter

Options de langue : **Français (cette version)**. L'espace de travail i18n existe dans `i18n/`; les variantes README localisées doivent être générées une par une lors des étapes suivantes.

![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9)
![Frontend](https://img.shields.io/badge/frontend-PWA-10b981)
![Runtime](https://img.shields.io/badge/runtime-local%20state-orange)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)

PWA de type Scratch + backend Tornado pour piloter un pipeline automatisé d'écriture de roman (et de développement d'application).

Ce dépôt inclut aussi `AutoAppDev/` comme sous-module (scripts d'auto-développement réutilisables).

## Vue d'ensemble

AutoNovelWriter fournit une couche d'orchestration locale pour :
- Éditer un script de pipeline canonique (`pipeline.script`) via le texte source et l'interface blocs.
- Exécuter un backend reprenable avec curseur persistant et résultats d'actions.
- Gérer projets, matériaux, sorties, lots de tâches et modèles d'actions.
- Diffuser les mises à jour en direct via WebSocket (`/ws`) vers la PWA.

Le runtime mutable canonique est `autonovelwriter/runtime/` (ignoré par git).

| Zone | Fonction |
|---|---|
| Rédaction du pipeline | Modifier le script canonique + l'UI blocs imbriquée depuis une source unique de vérité |
| Exécution | Exécuteur reprenable avec curseur persistant et résultats d'actions |
| Opérations projet | Matériaux, sorties, paramètres et activation des lots de tâches par projet |
| UX temps réel | Événements `/ws` pour statut/journal/sortie/tâche/action |

## Fonctionnalités

- Éditeur de pipeline type Scratch adossé à un script canonique + parser/AST.
- APIs de contrôle de l'exécuteur (`start/pause/resume/stop`) avec état reprenable.
- Conteneurs de flux de contrôle : `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Bibliothèque d'actions avec modèles par défaut + remplacements utilisateur en copy-on-edit.
- Surcharges de paramètres d'écriture de roman par projet avec sémantique d'héritage.
- Flux génération/index/détails/activation de lots de tâches pour `FOREACH_TASK`.
- Indexation des sorties et endpoints d'aperçu du dernier PDF de roman.
- Dictionnaires i18n PWA intégrés (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Scripts utilitaires tmux et pilote auto-dev Codex reprenable.

## 🗂️ Structure du projet

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # déclaration du sous-module AutoAppDev
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # point d'entrée backend principal + handlers API/WS + logique d'exécution
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # tests unitaires backend
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # logique UI + dictionnaires i18n embarqués
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # état/IO mutables (ignorés par git)
├── scripts/
│   ├── run_autonovelwriter_tmux.sh
│   ├── setup_conda_env.sh
│   ├── setup_and_run_autonovelwriter.sh
│   ├── auto-autonovelwriter-development.sh
│   └── backups/
├── scripts-legacy/
├── docs/
│   ├── autonovelwriter_spec.md
│   ├── auto-development-guide.md
│   └── ORDERING_RATIONALE.md
├── references/
│   └── autonovelwriter_dev/
├── examples/
│   └── ralph-wiggum-example.sh
├── i18n/                          # présent (actuellement sans fichiers)
└── AutoAppDev/                    # projet compagnon lié
```

## ✅ Prérequis

| Dépendance | Requis | Notes |
|---|---|---|
| Python `3.11+` | Oui | Base recommandée |
| `pip` | Oui | Installer les dépendances backend |
| `tmux` | Non | Nécessaire pour le script lanceur multi-panneaux |
| `conda` | Non | Scripts utilitaires optionnels |
| `node` | Non | Optionnel pour exécuter directement le fichier de test PWA |

## ⚙️ Installation

### Option A : helper Conda (recommandé pour ce dépôt)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Puis exécuter avec tmux :

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B : installation + lancement en une commande

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Option C : installation manuelle avec pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

## 🚀 Utilisation

## Exécution dev (Backend + PWA)

Backend (Tornado) :
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

Le backend sert aussi les assets statiques PWA depuis `autonovelwriter/pwa/` par défaut, vous pouvez donc ouvrir :
- `http://127.0.0.1:8787/` (PWA)
- WebSocket : `ws://127.0.0.1:8787/ws`

Optionnel : PWA (serveur statique de dev séparé) :
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

Ouvrez la PWA sur `http://127.0.0.1:5173` et connectez-la au backend (par défaut `ws://127.0.0.1:8787/ws`).

tmux (lancer les deux panneaux + suivi des logs) :
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Helper d'environnement Conda :
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Le script pilote du dépôt (`scripts/auto-autonovelwriter-development.sh`) peut également démarrer une session tmux pendant l'auto-dev.

### Workflow typique

1. Démarrer le backend (ou le helper tmux).
2. Ouvrir la PWA.
3. Éditer le pipeline via les blocs et/ou la zone de texte du script.
4. Valider/sauvegarder le pipeline.
5. Démarrer l'exécuteur et surveiller logs/statut/événements.
6. Examiner les sorties générées/les lots de tâches.

## 🧠 Chemins runtime

Tout l'état mutable et les E/S se trouvent sous `autonovelwriter/runtime/` (ignoré par git) :

| Chemin | But |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | utilisateur -> système (déposer des `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | système -> utilisateur (le backend écrit les messages chat) |
| `autonovelwriter/runtime/state/` | état JSON persistant (paramètres, pipeline, exécuteur, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | miroir chat sqlite (en plus de chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | pointeur « projet actif » persistant |
| `autonovelwriter/runtime/tasks/` | fichiers de file de tâches |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | lots de tâches générés (p. ex. depuis `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | matériaux du projet (entrées) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | sorties du projet (brouillons/exports) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | surcharges de paramètres d'écriture par projet (p. ex. langue du roman) |
| `autonovelwriter/runtime/actions/defaults/` | modèles par défaut initialisés de la bibliothèque d'actions (considérés immuables) |
| `autonovelwriter/runtime/actions/user/` | modèles utilisateur de la bibliothèque d'actions (créés via copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | entrées chat miroir pour ingestion par le pipeline d'écriture |

## 🧩 Script pipeline (artefact canonique)

Le pipeline est représenté comme un script formaté sur disque :
- `autonovelwriter/runtime/state/pipeline.script`

Le backend le sert via `GET/POST /api/pipeline` sous forme de :
- `script` (canonique, lignes shell-like `STEP <type>` / `DISABLED <type>`)
- JSON `pipeline` (dérivé, liste aplatie pour un rendu blocs simple)
- `pipeline_ast` (dérivé, structure imbriquée utilisée pour les boucles + l'UI d'indentation)

L'exécuteur lance les étapes dérivées du même parser/AST v2 ; ce que la PWA affiche correspond donc à ce qui s'exécute.
Le flux de contrôle de l'exécuteur prend en charge les conteneurs v2 :
- `ROUND <n>` répète ses enfants `n` fois.
- `FOREACH_TASK` exécute ses enfants une fois par tâche dans la liste active (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` exécute ses enfants une fois par entrée de la liste `payload.actions` de la tâche en cours (prévu pour être imbriqué sous `FOREACH_TASK`).

Reprise :
- L'exécuteur persiste un curseur d'exécution reprenable dans `autonovelwriter/runtime/state/runner_state.json`.
- Le curseur n'avance qu'après réussite complète d'un bloc (les redémarrages ne sautent donc pas le travail inachevé).
- Si le script pipeline canonique change (mismatch de hash), l'exécuteur s'arrête et nécessite un redémarrage (curseur invalidé).
- L'exécuteur persiste des enregistrements `ActionResult` par étape dans `autonovelwriter/runtime/state/action_results.jsonl` et utilise un `exec_id` déterministe par étape pour éviter de dupliquer des résultats déjà validés lors d'un redémarrage.
  - En exécution dans `FOREACH_ACTION`, les ActionResults incluent `action_index`, `action_id_ref` et `action_key`, et les vars incluent `prev` plus des scopes explicites `task.prev` vs `action.prev`.

Le script pipeline v2 prend en charge l'imbrication :
- `LOOP <n>` introduit un bloc de boucle
- `ROUND <n>` introduit un bloc conteneur de « rounds »
- `FOREACH_TASK` introduit un bloc conteneur par tâche
- `FOREACH_ACTION` introduit un bloc conteneur par action (l'exécuteur itère `task.payload.actions`)
- `IF <expr>` introduit un bloc conteneur conditionnel (parse/render ; l'exécuteur n'exécute actuellement que la branche then)
- `ELSE` introduit une branche alternative optionnelle sous un bloc `IF`
- les enfants sont indentés de 2 espaces par niveau

Validation (sans persistance) :
- `POST /api/pipeline/validate` renvoie un aperçu canonique plus `pipeline_ast`, des avertissements et des erreurs.

La PWA affiche le script dans une zone de texte (source de vérité) et rend des blocs imbriqués depuis `pipeline_ast`.
Si l'endpoint backend de validation est inaccessible, la PWA bascule sur un parser local prenant en charge les mêmes verbes v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Notes sur l'UI blocs :
- Les comptes de répétition `LOOP` et `ROUND` sont éditables en ligne dans la liste des blocs ; les modifications valides mettent immédiatement à jour la zone de texte du script canonique.
- La barre d'outils Blocs peut insérer des conteneurs `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` et `IF` sans édition manuelle du script (encapsule le bloc sélectionné, ou ajoute un conteneur valide non vide).
- Les blocs peuvent être supprimés du canvas (bouton Delete par bloc ; touche clavier `Delete` quand un bloc est sélectionné). Les suppressions de conteneurs réintègrent les enfants, et l'éditeur garde les conteneurs non vides pour éviter les scripts invalides.
- Les blocs `IF` restent structurellement valides dans l'éditeur : `ELSE` ne peut pas persister hors d'un `IF`, et la branche then reste non vide.
- Les blocs `STEP` exposent les contrôles de la bibliothèque d'actions : sélecteur d'action, `Customize` (copier une action par défaut vers une action utilisateur puis basculer), et `Edit` (modal Action Editor pour `name/tool/prompt/script`).

## 🔧 Configuration

### Variables d'environnement

Utiliser `autonovelwriter/backend/.env.example` comme modèle. Variables clés utilisées par backend/runtime :

- `AUTONOVELWRITER_RUNTIME_ROOT` (par défaut `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (par défaut `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (par défaut `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (par défaut `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (par défaut : parent de la racine du dépôt)
- `AUTONOVELWRITER_WRITER_SCRIPT` (par défaut `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (par défaut `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (par défaut `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (gate d'exécution agent, désactivé par défaut)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (surcharge optionnelle du binaire codex)

## 🌐 APIs backend clés

### APIs HTTP

- Santé : `GET /api/health`
- Paramètres : `GET/POST /api/settings`
- Projets : `GET /api/projects`, `POST /api/projects/active`
- Paramètres projet (projet actif) : `GET/POST /api/projects/settings` (surcharges par projet avec sémantique d'héritage : `novel_language`, `novel_tone`, `novel_target_length_words`)
- Index des matériaux (projet actif) : `GET /api/materials/index`
- Index des sorties (projet actif) : `GET /api/outputs/index`
- Index des lots de tâches : `GET /api/tasks/batches/index` (optionnel : `?project=<project_id>`)
- Détails d'un lot de tâches : `GET /api/tasks/batches/<batch_id>`
- Activation d'un lot de tâches : `POST /api/tasks/batches/<batch_id>/activate` (écrit `runtime/tasks/tasks.json` et `active_tasks.json` du projet)
- Bibliothèque d'actions : `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (mise à jour copy-on-edit pour les actions par défaut)
- Pipeline (script canonique + JSON dérivé) : `GET/POST /api/pipeline`
- Validation pipeline (aperçu uniquement) : `POST /api/pipeline/validate`
- Aperçu/chargement du pipeline d'écriture de référence :
  - `GET /api/pipeline/reference_writer` (lit et parse `../scripts/auto-xiyouzhiyuan-writer.sh` comme référence)
  - `POST /api/pipeline/reference_writer/load` (charge le résultat parsé dans le pipeline runtime ; ne modifie jamais le script source)
- Chat : `GET /api/chat/history`, `POST /api/chat/send`
- Dernier PDF de roman :
  - `GET /api/novel/latest` (métadonnées)
  - `GET /api/novel/latest/pdf` (flux PDF inline pour le visualiseur)
- Contrôle de l'exécuteur : `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Test agent (gated) : `POST /api/agent/test` (exécute `codex --version` uniquement quand activé + gate env)

### WebSocket

- Endpoint : `/ws`
- Événements broadcast : `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Sorties de l'exécuteur (stub de brouillon)

Quand le pipeline contient un bloc `STEP write`, l'exécuteur backend crée un fichier de brouillon stub sous :
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Le backend émet aussi :
- l'événement WS `output_created` avec `path` et `project_rel_path`
- une ligne `log` `[output] created: ...`

La PWA inclut un panneau Sorties minimal qui liste les fichiers via `GET /api/outputs/index` et se rafraîchit sur `output_created`.

## 📦 Tâches de l'exécuteur (stub de lot)

Quand le pipeline contient un bloc `STEP meta_tasks_generate`, l'exécuteur backend crée un lot de tâches stub sous :
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Le backend émet :
- l'événement WS `tasks_batch_created` avec `batch_dir`, `tasks_jsonl` et `task_count`
- une ligne `log` `[tasks] created batch: ...`

La PWA inclut un panneau Lots de tâches minimal qui liste les lots via `GET /api/tasks/batches/index` et se rafraîchit sur `tasks_batch_created`.
Elle peut aussi afficher les détails d'un lot (`GET /api/tasks/batches/<batch_id>`) et activer un lot pour en faire la liste de tâches courante de `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🤖 Paramètres agent / gate Codex

Le panneau Paramètres de la PWA persiste les réglages agent via `/api/settings` dans `autonovelwriter/runtime/state/settings.json`.

Pour des raisons de sécurité, le backend ne lancera pas la CLI `codex` sauf si les deux conditions sont vraies :
- `settings.agent.enabled=true` et `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` est défini dans l'environnement

Ne jamais commit de secrets. Utiliser `autonovelwriter/backend/.env.example` comme modèle pour les variables d'environnement locales.

## 🌍 PWA I18N (langue de l'UI)

La PWA dispose d'un système i18n intégré léger.

- Forcer la langue de l'UI : ajouter `?lang=<code>` à l'URL de la PWA (ex. `?lang=ja`).
- Persistance par navigateur dans localStorage : `anw_lang`.
- Langues UI prises en charge : `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## 📚 Paramètres de roman (séparés de la langue UI)

Les préférences d'écriture de roman sont stockées dans les paramètres backend sous `settings.novel.*` dans :
- `autonovelwriter/runtime/state/settings.json`

Elles sont volontairement **séparées** de la langue UI de la PWA (`?lang=` / `anw_lang`).

Les surcharges par projet sont stockées dans :
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Champs actuels (éditables dans la modale Paramètres de la PWA) :
- `settings.novel.language` (codes type BCP-47 comme `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Champs actuels de surcharge au niveau projet (vide/non défini = hériter du global) :
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 Exemples

### Exécution locale minimale

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### Exécution tmux sans auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Exécuter directement les fichiers de test backend

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Exécuter directement le fichier de test logique PWA

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Exemple de helper d'automatisation scripté

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Notes de développement

### Workflow driver (auto-dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Progression auto-dev (générée)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` exécute une boucle reprenable pilotée par Codex sur les tâches sous `references/autonovelwriter_dev/` et **commit/push après chaque étape** (plan/implement/debug/fix/i18n/summary/update_readme).

Contrôles utiles :
- Arrêter après la tâche en cours : `touch references/autonovelwriter_dev/STOP`
- Réinitialiser le suivi d'état (conserve la queue) : `scripts/auto-autonovelwriter-development.sh --reset-state`
- Démarrer une nouvelle session Codex : `scripts/auto-autonovelwriter-development.sh --new-session`
- Bonne pratique : exécuter dans une branche/worktree propre et surveiller `references/autonovelwriter_dev/state.tsv` avant redémarrage.

## 📚 Contenu

- `docs/autonovelwriter_spec.md` : spécification produit du contrôleur type Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh` : auto-développer l'app AutoNovelWriter elle-même (boucle de tâches : plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md` : philosophie et exigences bilingues (EN/ZH) pour un agent d'auto-développement longue durée et reprenable.
- `docs/ORDERING_RATIONALE.md` : exemple de raisonnement d'ordonnancement des étapes pilotées par captures d'écran.
- `scripts-legacy/` : anciens scripts d'automatisation conservés en référence mais non utilisés par AutoNovelWriter.
- `examples/ralph-wiggum-example.sh` : exemple de helper d'automatisation Codex CLI.

### Notes développeur additionnelles

- Les tests backend se trouvent dans `autonovelwriter/backend/tests/`.
- Un petit test de comportement PWA se trouve dans `autonovelwriter/pwa/tests/`.
- Le répertoire racine `i18n/` existe mais est actuellement vide ; les traductions UI sont actuellement embarquées dans `autonovelwriter/pwa/app.js`.

## 🧯 Dépannage

- `tmux not found in PATH` :
  - Installer tmux, ou exécuter manuellement les serveurs backend/statiques.
- `conda not found in PATH` lors de l'usage des scripts `--env` :
  - Installer Miniconda/Anaconda, ou ignorer conda et utiliser l'installation manuelle `pip`.
- La PWA ne peut pas se connecter au backend :
  - Vérifier l'adresse/le port backend et l'endpoint WebSocket `ws://<host>:<port>/ws`.
- `POST /api/agent/test` renvoie gated/disabled :
  - Vérifier `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, et la variable d'environnement `AUTONOVELWRITER_ENABLE_CODEX=1`.
- L'exécuteur pipeline s'arrête après une modification du script :
  - Comportement attendu ; le curseur est invalidé en cas de mismatch de hash du script pipeline et nécessite un redémarrage.

## 🧭 Feuille de route

- Finaliser et stabiliser les éléments restants de la queue auto-dev (voir le bloc de progression généré ci-dessus).
- Étendre les assets i18n externalisés au niveau dépôt sous `i18n/` (actuellement présent mais vide).
- Élargir la couverture des tests automatisés sur les cas limites de l'exécuteur et les interactions PWA.
- Continuer l'amélioration de la bibliothèque d'actions et des workflows d'itération tâches/actions.

## 🤝 Contribution

Les contributions sont les bienvenues.

Conseils pragmatiques pour ce dépôt :
- Commencer par `docs/autonovelwriter_spec.md` et `docs/auto-development-guide.md`.
- Conserver les mutations runtime sous `autonovelwriter/runtime/` (ignoré par git), pas dans les fichiers suivis.
- Préférer des PR incrémentales avec des commandes d'exécution/test reproductibles.
- Si vous modifiez la sémantique du pipeline ou les contrats API, mettre à jour README et tests associés ensemble.

Remarque : aucun `CONTRIBUTING.md` dédié n'a été trouvé à la racine du dépôt au moment de cette version.

## ❤️ Sponsor & dons

- GitHub Sponsors : https://github.com/sponsors/lachlanchen
- Donate : https://chat.lazying.art/donate
- PayPal : https://paypal.me/RongzhouChen
- Stripe : https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 Licence

Le fichier/statut de licence n'est pas explicitement déclaré à la racine du dépôt dans ce contexte de brouillon.

Note d'hypothèse :
- Si vous souhaitez clarifier la redistribution open source, ajoutez un fichier `LICENSE` à la racine et mettez à jour cette section en conséquence.
