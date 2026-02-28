[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)




[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>PWA de type Scratch + backend Tornado pour piloter un pipeline automatisé d’écriture de romans (et de développement d’apps).</strong></p>
  <p>
    <img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white" />
    <img alt="Backend" src="https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9" />
    <img alt="Frontend" src="https://img.shields.io/badge/frontend-PWA-10b981" />
    <img alt="Realtime" src="https://img.shields.io/badge/realtime-WebSocket-06b6d4" />
    <img alt="Pipeline" src="https://img.shields.io/badge/pipeline-script%20%2B%20AST-2563eb" />
    <img alt="Runtime" src="https://img.shields.io/badge/runtime-local%20state-orange" />
    <img alt="Status" src="https://img.shields.io/badge/status-active%20development-f59e0b" />
    <img alt="Canonical docs" src="https://img.shields.io/badge/docs-README.md-critical?style=flat" />
    <img alt="Languages" src="https://img.shields.io/badge/i18n-10%2B%20languages-8b5cf6?style=flat" />
  </p>
</div>

Ce dépôt intègre aussi `AutoAppDev/` en sous-module (scripts de développement automatisé réutilisables).

> [!TIP]
> `README.md` est la base canonique. Les variantes localisées se trouvent dans `i18n/` et sont liées par l’unique ligne d’options de langue en haut.

## 🧭 Aperçu du projet

| Faits rapides | Détails |
|---|---|
| Stack principal | Backend Python + Tornado, frontend PWA navigateur |
| UX centrale | Éditeur script + blocs adossé à une source canonique unique |
| Mode d’exécution | Runner reprenable avec curseur persistant et résultats d’actions |
| Temps réel | Endpoint WebSocket sur `/ws` |
| Racine runtime mutable | `autonovelwriter/runtime/` (ignoré par git) |

## 🎯 Navigation en un coup d'œil

| 🎯 À utiliser maintenant | 🔧 Commande / URL |
|---|---|
| Ouvrir la PWA locale | `http://127.0.0.1:8787/` |
| Se connecter aux mises à jour live | `ws://127.0.0.1:8787/ws` |
| Démarrer le backend vite | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Lancer setup + démarrage | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

## 🔌 Paramètres de lancement

| Paramètres de lancement | Valeur |
|---|---|
| URL PWA | `http://127.0.0.1:8787/` |
| URL WebSocket | `ws://127.0.0.1:8787/ws` |
| Hôte/port backend | `127.0.0.1:8787` |

## Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Navigation en un coup d'œil](#-navigation-en-un-coup-doeil)
- [Paramètres de lancement](#-paramètres-de-lancement)
- [📌 Vue d’ensemble](#-vue-densemble)
- [✨ Fonctionnalités](#️-fonctionnalités)
- [🧭 Architecture en un coup d'œil](#️-architecture-en-un-coup-doeil)
- [🗂️ Structure du projet](#️-structure-du-projet)
- [✅ Prérequis](#-prérequis)
- [🚀 Installation](#-installation)
- [🧪 Utilisation](#-utilisation)
- [⚙️ Configuration](#️-configuration)
- [🔌 APIs backend clés](#-apis-backend-clés)
- [📁 Chemins runtime](#-chemins-runtime)
- [🧩 Script de pipeline (artefact canonique)](#️-script-de-pipeline-artefact-canonique)
- [📝 Sorties du runner (brouillon)](#-sorties-du-runner-brouillon)
- [📦 Tâches du runner (lot)](#-tâches-du-runner-lot)
- [🔐 Paramètres agent / garde Codex](#-paramètres-agent--garde-codex)
- [🌐 I18N PWA (langue de l’UI)](#-i18n-pwa-langue-de-lui)
- [🖋️ Paramètres de roman (séparés de la langue UI)](#️-paramètres-de-roman-séparés-de-la-langue-ui)
- [🧰 Exemples](#️-exemples)
- [🛠️ Notes de développement](#️-notes-de-développement)
- [🧪 Notes de test](#-notes-de-test)
- [📚 Contenu du dépôt](#-contenu-du-dépôt)
- [🧯 Dépannage](#-dépannage)
- [🗺️ Feuille de route](#️-feuille-de-route)
- [🤝 Contribuer](#-contribuer)
- [❤️ Support](#-support)
- [📄 Licence](#-licence)

## 📌 Vue d’ensemble

AutoNovelWriter fournit une couche d’orchestration locale pour :
- éditer un script de pipeline canonique (`pipeline.script`) via texte source et interface bloc.
- exécuter une logique backend reprenable avec curseur persistant et résultats d’actions.
- gérer projets, matériaux, sorties, lots de tâches et modèles d’actions.
- diffuser des mises à jour en direct via WebSocket (`/ws`) vers la PWA.

Le runtime mutable canonique est `autonovelwriter/runtime/` (contenu ignoré par git).

| Zone | Rôle |
|---|---|
| Écriture du pipeline | Éditer le script canonique + l’UI blocs imbriquée depuis une source de vérité partagée |
| Exécution | Runner reprenable avec curseur persistant et résultats d’actions |
| Gestion projet | Matériels, sorties, paramètres et activation des lots de tâches par projet |
| UX temps réel | Événements `/ws` pour statut/log/sorties/tâches/actions |

## ✨ Fonctionnalités

- Éditeur de pipeline de type Scratch adossé à un script canonique + parseur/AST.
- APIs de contrôle du runner (`start/pause/resume/stop`) avec état reprenable.
- Conteneurs de contrôle de flux : `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Bibliothèque d’actions avec templates par défaut + surcharge utilisateur via copy-on-edit.
- Surcharges de paramètres de roman par projet avec sémantique d’héritage.
- Flux de génération/index/détails/activation de lots de tâches pour `FOREACH_TASK`.
- Indexation des sorties et endpoints de prévisualisation PDF du dernier roman.
- Dictionnaires i18n intégrés côté PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Scripts d’assistance tmux et pilote auto-dev Codex reprenable.

## 🧭 Architecture en un coup d'œil

```text
Browser (PWA)
  ├─ pipeline editor (script + blocks)
  ├─ settings / projects / actions / tasks / outputs panels
  └─ WebSocket client (/ws)
          │
          ▼
Tornado backend (autonovelwriter/backend/server.py)
  ├─ REST APIs (/api/*)
  ├─ WebSocket broadcast hub
  ├─ parser + AST + canonical script persistence
  ├─ resumable runner + action result commit log
  └─ runtime bootstrap (dirs + defaults)
          │
          ▼
autonovelwriter/runtime/ (mutable, local-first)
  ├─ state/ (pipeline, settings, runner, chat)
  ├─ projects/<id>/ (materials, outputs, project settings)
  ├─ tasks/ (active list + generated batches)
  ├─ actions/ (defaults + user overrides)
  └─ logs/ (runner.log)
```

## 🗂️ Structure du projet

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # AutoAppDev submodule declaration
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # main backend entrypoint + API/WS handlers + runner logic
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # backend unit tests
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # UI logic + embedded i18n dictionaries
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # mutable state/IO (contents gitignored)
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
├── i18n/
│   ├── README.ar.md
│   ├── README.de.md
│   ├── README.es.md
│   ├── README.fr.md
│   ├── README.ja.md
│   ├── README.ko.md
│   ├── README.ru.md
│   ├── README.vi.md
│   ├── README.zh-Hans.md
│   └── README.zh-Hant.md
└── AutoAppDev/                    # git submodule (git@github.com:lachlanchen/AutoAppDev.git)
```

## ✅ Prérequis

| Dépendance | Requis | Notes |
|---|---|---|
| Python `3.11+` | Oui | Référence de base recommandée |
| `pip` | Oui | Installer les dépendances backend |
| `tmux` | Non | Nécessaire pour le script de lancement multi-panneaux |
| `conda` | Non | Scripts utilitaires optionnels |
| `node` | Non | Optionnel pour exécuter directement le fichier de test PWA |

## 🚀 Installation

| Chemin | Idéal quand | Commande |
|---|---|---|
| Option A | Vous utilisez conda et voulez la configuration fournie par le dépôt | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Vous voulez setup + run en une commande | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Vous préférez gérer `pip` manuellement | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A : assistant Conda (recommandé pour ce dépôt)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Puis exécutez avec tmux :

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B : configuration + exécution en une fois

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Option C : installation manuelle avec pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

### Optionnel : initialiser le sous-module

```bash
git submodule update --init --recursive
```

## 🧪 Utilisation

| Flux | Commande / URL |
|---|---|
| Démarrer le backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Ouvrir l’app | `http://127.0.0.1:8787/` |
| Endpoint WebSocket | `ws://127.0.0.1:8787/ws` |
| PWA statique optionnelle | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| Lanceur tmux | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Démarrage rapide (sans tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# open http://127.0.0.1:8787/
```

### Exécution dev (backend + PWA)

Backend (Tornado) :

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

Le backend sert aussi les ressources statiques de la PWA depuis `autonovelwriter/pwa/` par défaut, donc vous pouvez ouvrir :
- `http://127.0.0.1:8787/` (PWA)
- WebSocket : `ws://127.0.0.1:8787/ws`

Optionnel : PWA (serveur statique dev séparé) :

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Ouvrez la PWA sur `http://127.0.0.1:5173` et pointez-la vers le backend (par défaut `ws://127.0.0.1:8787/ws`).

tmux (lance les deux panneaux + suivi des logs) :

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Environnement Conda :

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Le script de pilotage du dépôt (`scripts/auto-autonovelwriter-development.sh`) peut aussi démarrer une session tmux pendant l’auto-dev.

### Flux de travail type

1. Démarrer le backend (ou l’assistant tmux).
2. Ouvrir la PWA.
3. Éditer le pipeline via les blocs et/ou la zone de texte du script.
4. Valider/sauvegarder le pipeline.
5. Démarrer le runner et suivre les logs/statuts/événements.
6. Examiner les sorties générées et les lots de tâches.

## ⚙️ Configuration

### Variables d’environnement

Utilisez `autonovelwriter/backend/.env.example` comme modèle. Variables clés utilisées par le backend/runtime :

- `AUTONOVELWRITER_RUNTIME_ROOT` (par défaut `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (par défaut `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (par défaut `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (valeur CLI par défaut : `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (par défaut : parent de la racine du dépôt)
- `AUTONOVELWRITER_WRITER_SCRIPT` (par défaut `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (par défaut `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (par défaut `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (garde d’exécution agent, désactivée par défaut)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (surcharge optionnelle du binaire Codex)

### Options CLI des scripts

`run_autonovelwriter_tmux.sh` :
- `--session <name>`
- `--backend-port <n>`
- `--pwa-port <n>`
- `--host <ip>`
- `--env <conda_env>`
- `--debug`
- `--kill`
- `--no-attach`

`setup_conda_env.sh` :
- `--name <env>`
- `--python <ver>`
- `--force-recreate`

`setup_and_run_autonovelwriter.sh` :
- `--env <name>`
- `--python <ver>`
- `--session <name>`
- `--backend-port <n>`
- `--pwa-port <n>`
- `--host <ip>`
- `--force-recreate`
- `--debug`
- `--kill`
- `--no-attach`

## 🔌 APIs backend clés

| Groupe API | Endpoints principaux |
|---|---|
| Santé et paramètres | `/api/health`, `/api/settings` |
| Projets et paramètres projet | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tâches | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Actions | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Sorties et prévisualisation du roman | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| Temps réel | `/ws` |

### APIs HTTP

- Santé : `GET /api/health`
- Paramètres : `GET/POST /api/settings`
- Projets : `GET /api/projects`, `POST /api/projects/active`
- Paramètres de projet (projet actif) : `GET/POST /api/projects/settings` (surcharges par projet avec sémantique d’héritage : `novel_language`, `novel_tone`, `novel_target_length_words`)
- Index des matériaux (projet actif) : `GET /api/materials/index`
- Index des sorties (projet actif) : `GET /api/outputs/index`
- Index des lots de tâches : `GET /api/tasks/batches/index` (optionnel : `?project=<project_id>`)
- Détails d’un lot de tâches : `GET /api/tasks/batches/<batch_id>`
- Activation d’un lot de tâches : `POST /api/tasks/batches/<batch_id>/activate` (écrit `runtime/tasks/tasks.json` et `active_tasks.json` du projet)
- Bibliothèque d’actions : `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (mise à jour copy-on-edit pour les modèles par défaut)
- Pipeline (script canonique + JSON dérivé) : `GET/POST /api/pipeline`
- Validation du pipeline (aperçu uniquement) : `POST /api/pipeline/validate`
- Aperçu/chargement du pipeline writer de référence :
  - `GET /api/pipeline/reference_writer` (lit et parse `../scripts/auto-xiyouzhiyuan-writer.sh` comme source de référence)
  - `POST /api/pipeline/reference_writer/load` (charge le résultat parsé dans le pipeline runtime ; ne modifie jamais le script source)
- Chat : `GET /api/chat/history`, `POST /api/chat/send`
- Dernier PDF du roman :
  - `GET /api/novel/latest` (métadonnées)
  - `GET /api/novel/latest/pdf` (flux PDF inline pour le visualiseur)
- Contrôle du runner : `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Test agent (protégé) : `POST /api/agent/test` (exécute `codex --version` uniquement quand activé + condition d’environnement)

### WebSocket

- Endpoint : `/ws`
- Événements diffusés : `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Chemins runtime

Tout l’état mutable et les E/S vivent sous `autonovelwriter/runtime/` :

| Chemin | Rôle |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | utilisateur -> système (déposer des `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | système -> utilisateur (le backend écrit les messages de chat) |
| `autonovelwriter/runtime/state/` | état JSON persistant (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | miroir de chat sqlite (en plus de chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | pointeur persistant vers le projet actif |
| `autonovelwriter/runtime/tasks/` | fichiers de file de tâches |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | lots de tâches générés (ex. depuis `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | matériaux du projet (entrées) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | sorties du projet (brouillons/exports) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | surcharges des paramètres d’écriture du projet (ex. langue du roman) |
| `autonovelwriter/runtime/actions/defaults/` | modèles par défaut de la bibliothèque d’actions (considérés immuables) |
| `autonovelwriter/runtime/actions/user/` | templates utilisateur de la bibliothèque d’actions (créés via copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | entrées chat miroir pour ingestion par le pipeline writer |

## 🧩 Script de pipeline (artefact canonique)

Le pipeline est représenté comme un script formaté sur disque :
- `autonovelwriter/runtime/state/pipeline.script`

Le backend le sert via `GET/POST /api/pipeline` sous forme de :
- `script` (canonique, lignes shell-like `STEP <type>` / `DISABLED <type>`)
- JSON `pipeline` (dérivé, liste aplatie pour un rendu simple en blocs)
- `pipeline_ast` (dérivé, structure imbriquée utilisée pour l’UI de boucles + indentation)

Le runner exécute des étapes issues du même parseur/AST v2, donc ce qui s’affiche dans la PWA correspond à ce qui s’exécute.

Le flow de contrôle du runner supporte les conteneurs v2 :
- `ROUND <n>` répète ses enfants `n` fois.
- `FOREACH_TASK` exécute ses enfants une fois par tâche dans la liste active (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` exécute ses enfants une fois par entrée de la liste `payload.actions` de la tâche courante (prévu pour être imbriqué sous `FOREACH_TASK`).

Reprise :
- Le runner persiste un curseur d’exécution reprenable dans `autonovelwriter/runtime/state/runner_state.json`.
- Le curseur n’avance qu’après la réussite complète d’un bloc (ainsi les redémarrages ne sautent pas de travail non terminé).
- Si le script de pipeline canonique change (hash différent), le runner s’arrête et exige un redémarrage (curseur invalidé).
- Le runner persiste les enregistrements `ActionResult` par étape dans `autonovelwriter/runtime/state/action_results.jsonl` et utilise un `exec_id` déterministe par étape pour éviter de dupliquer des résultats déjà commités après redémarrage.
- En mode `FOREACH_ACTION`, les ActionResults incluent `action_index`, `action_id_ref` et `action_key`, et les variables exposent `prev` avec des scopes explicites `task.prev` vs `action.prev`.

Le script pipeline v2 prend en charge l’imbrication :
- `LOOP <n>` introduit un bloc de boucle.
- `ROUND <n>` introduit un bloc conteneur de rounds.
- `FOREACH_TASK` introduit un bloc conteneur par tâche.
- `FOREACH_ACTION` introduit un bloc conteneur par action (runner itère `task.payload.actions`).
- `IF <expr>` introduit un conteneur conditionnel (parse/render ; le runner exécute la branche then uniquement pour l’instant).
- `ELSE` introduit une branche alternative optionnelle sous un bloc `IF`.
- Les enfants sont indentés de 2 espaces par niveau.

Validation (sans persistance) :
- `POST /api/pipeline/validate` renvoie un aperçu canonique plus `pipeline_ast`, warnings et erreurs.

La PWA affiche le script dans une zone de texte (source de vérité) et rend les blocs imbriqués depuis `pipeline_ast`.
Si l’endpoint backend de validation est injoignable, la PWA bascule vers un parseur local qui supporte les mêmes verbes v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Notes sur l’UI des blocs :
- Les compteurs de répétition `LOOP` et `ROUND` sont éditables en ligne dans la liste de blocs ; les modifications valides mettent immédiatement à jour la zone de texte du script canonique.
- La barre d’outils des blocs peut insérer des conteneurs `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` et `IF` sans édition manuelle du script (encapsule le bloc sélectionné, ou ajoute un conteneur valide non vide).
- Les blocs peuvent être supprimés du canvas (bouton Delete par bloc ; touche `Delete` quand un bloc est sélectionné). Les suppressions de conteneurs remontent les enfants, et l’éditeur maintient les conteneurs non vides pour éviter des scripts invalides.
- Les blocs `IF` restent structurellement valides dans l’éditeur : `ELSE` ne peut pas exister hors d’un `IF`, et la branche then reste non vide.
- Les blocs `STEP` exposent les contrôles de la bibliothèque d’actions : sélecteur d’action, `Customize` (copie un template par défaut en action utilisateur et bascule), et `Edit` (modale Action Editor pour `name/tool/prompt/script`).

## 📝 Sorties du runner (brouillon)

Quand le pipeline contient un bloc `STEP write`, le runner backend crée un fichier brouillon sous :
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Le backend émet aussi :
- événement WS `output_created` avec `path` et `project_rel_path`
- une ligne de `log` : `[output] created: ...`

La PWA inclut un panneau Outputs minimal qui liste les fichiers via `GET /api/outputs/index` et se rafraîchit sur `output_created`.

## 📦 Tâches du runner (lots)

Quand le pipeline contient un bloc `STEP meta_tasks_generate`, le runner backend crée un lot de tâches stub sous :
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Le backend émet :
- événement WS `tasks_batch_created` avec `batch_dir`, `tasks_jsonl`, et `task_count`
- une ligne de `log` : `[tasks] created batch: ...`

La PWA inclut un panneau Task Batches minimal qui liste les lots via `GET /api/tasks/batches/index` et se rafraîchit sur `tasks_batch_created`.
Il peut aussi afficher les détails d’un lot (`GET /api/tasks/batches/<batch_id>`) et activer un lot pour qu’il devienne la liste active de `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Paramètres agent / garde Codex

Le panneau Settings de la PWA persiste les paramètres de l’agent via `/api/settings` dans `autonovelwriter/runtime/state/settings.json`.

Pour la sécurité, le backend ne lancera pas le CLI `codex` à moins que les deux conditions suivantes soient vraies :
- `settings.agent.enabled=true` et `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` est défini dans l’environnement

Ne commitez jamais de secrets. Utilisez `autonovelwriter/backend/.env.example` comme modèle pour les variables d’environnement locales.

## 🌐 I18N PWA (langue de l’UI)

La PWA dispose d’un système i18n léger intégré.

- Forcer la langue UI : ajoutez `?lang=<code>` à l’URL PWA (par exemple `?lang=ja`).
- Persisté par navigateur dans localStorage : `anw_lang`.
- Langues UI supportées : `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Les variantes README locales du dépôt vivent actuellement dans `i18n/` et sont liées depuis l’unique ligne d’options de langue en haut de ce fichier.

| Fichiers README localisés (`i18n/`) | Statut |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Présent |

## 🖋️ Paramètres de roman (séparés de la langue UI)

Les préférences d’écriture sont stockées dans les paramètres backend sous `settings.novel.*` dans :
- `autonovelwriter/runtime/state/settings.json`

Elles sont intentionnellement séparées de la langue UI de la PWA (`?lang=` / `anw_lang`).

Les surcharges par projet sont stockées sous :
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Champs globaux actuels (éditables dans la modale Settings de la PWA) :
- `settings.novel.language` (codes proches de BCP-47 comme `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Champs de surcharge au niveau projet actuellement actifs (vide/non défini = hérite du global) :
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Exemples

### Exécution locale minimale

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### Exécution tmux sans attachement automatique

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

### Exemple d’automatisation scriptée

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Notes de développement

### Workflow du pilote (Auto-Dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Auto-Dev Progress (Generated)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` exécute une boucle reprise pilotée par Codex sur les tâches sous `references/autonovelwriter_dev/` et effectuera commit/push après chaque étape (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Contrôles utiles :
- Arrêter après la tâche en cours : `touch references/autonovelwriter_dev/STOP`
- Réinitialiser le suivi d’état (conserve la file) : `scripts/auto-autonovelwriter-development.sh --reset-state`
- Démarrer une session Codex neuve : `scripts/auto-autonovelwriter-development.sh --new-session`
- Bonne pratique : exécuter dans une branche/worktree propre et surveiller `references/autonovelwriter_dev/state.tsv` avant de redémarrer

### Hypothèses opérationnelles

- Ce README suppose un développement local-first sous Linux/macOS avec `bash` et Python 3.11+.
- L’état runtime sous `autonovelwriter/runtime/` est mutable et attendu non versionné.
- Le comportement pipeline décrit ici reflète l’implémentation actuelle du dépôt dans `autonovelwriter/backend/server.py` et `autonovelwriter/pwa/app.js`.

## 🧪 Notes de test

Il n’existe pas d’orchestrateur `Makefile`/`tox`/`npm test` à la racine de ce dépôt au moment de la rédaction.

Points d’entrée de test pratiques actuels :

| Zone | Point d’entrée |
|---|---|
| Parseur/AST backend | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Syntaxe foreach-action backend | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Sémantique runner backend | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Mise à jour de la bibliothèque d’actions backend | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| Comportement AST delete côté PWA | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (exécuter des fichiers de test individuellement)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

Si vous ajoutez ou modifiez la sémantique du runner, la syntaxe du pipeline ou le comportement de la bibliothèque d’actions, mettez à jour les tests et les notes README/API dans le même changement.

## 📚 Contenu du dépôt

- `docs/autonovelwriter_spec.md` : spécification produit du contrôleur de type Scratch (chat + dossier pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh` : auto-développe l’app AutoNovelWriter elle-même (boucle de tâches : `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md` : philosophie et exigences bilingues (EN/ZH) pour un agent d’auto-développement long-running et reprenable.
- `docs/ORDERING_RATIONALE.md` : exemple de rationale de séquencement.
- `scripts-legacy/` : anciens scripts d’automatisation conservés pour référence, non utilisés par AutoNovelWriter.
- `examples/ralph-wiggum-example.sh` : exemple d’assistant d’automatisation CLI Codex.

Notes développeur supplémentaires :
- Les tests backend vivent dans `autonovelwriter/backend/tests/`.
- Un petit test de comportement PWA se trouve dans `autonovelwriter/pwa/tests/`.
- `i18n/` contient les README localisés du dépôt, tandis que les dictionnaires i18n UI sont intégrés dans `autonovelwriter/pwa/app.js`.

## 🧯 Dépannage

| Symptôme | Vérifications |
|---|---|
| `tmux not found in PATH` | Installez tmux ou lancez manuellement les serveurs backend/standalone. |
| `conda not found in PATH` lors de l’usage des scripts `--env` | Installez Miniconda/Anaconda, ou ignorez conda et utilisez une installation `pip` manuelle. |
| La PWA ne se connecte pas au backend | Vérifiez l’adresse/port backend et l’endpoint WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` retourne gated/disabled | Vérifiez `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, et `AUTONOVELWRITER_ENABLE_CODEX=1` dans l’environnement. |
| Le runner de pipeline s’arrête après édition de script | Comportement attendu ; le curseur est invalidé si le hash du script pipeline ne correspond plus et redémarrage requis. |
| La PWA statique sur `:5173` fonctionne mais les appels API échouent | Vérifiez que le backend fonctionne sur `:8787` (ou mettez à jour backend/app target settings en conséquence). |

## 🗺️ Feuille de route

- Finaliser et stabiliser les éléments restants de la file auto-dev (voir le bloc de progression généré ci-dessus).
- Étendre et synchroniser les variantes README i18n au niveau dépôt dans `i18n/`.
- Étendre la couverture de tests automatisés pour les cas limites du runner et les interactions PWA.
- Continuer d’améliorer la bibliothèque d’actions et les flux d’itération tâches/actions.

## 🤝 Contribuer

Les contributions sont les bienvenues.

Recommandations pragmatiques pour ce dépôt :
- Commencez par `docs/autonovelwriter_spec.md` et `docs/auto-development-guide.md`.
- Conservez les mutations runtime sous `autonovelwriter/runtime/` (contenu ignoré par git), pas dans des fichiers suivis.
- Préférez des PR incrémentales avec commandes d’exécution/test reproductibles.
- Si vous modifiez la sémantique du pipeline ou les contrats API, mettez à jour README et tests ensemble.

Remarque : aucun `CONTRIBUTING.md` dédié n’a été trouvé à la racine du dépôt à ce stade.

---

## 📄 Licence

Le fichier/statut de licence n’est pas explicitement déclaré à la racine du dépôt dans ce contexte de brouillon.

Hypothèse :
- Si vous souhaitez clarifier une redistribution open source, ajoutez un fichier `LICENSE` à la racine et mettez cette section à jour en conséquence.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
