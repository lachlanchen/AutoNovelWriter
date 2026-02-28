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
  </p>
</div>

Ce dépôt intègre aussi `AutoAppDev/` en sous-module (scripts de développement automatisé réutilisables).

> [!TIP]
> `README.md` est la base canonique. Les variantes localisées se trouvent dans `i18n/` et sont liées par l’unique ligne d’options de langue en haut.

| Faits rapides | Détails |
|---|---|
| Stack principal | Backend Python + Tornado, frontend PWA dans le navigateur |
| UX cœur | Éditeur script + blocs adossé à une source canonique unique |
| Mode d’exécution | Runner reprenable avec curseur persistant et résultats d’actions |
| Temps réel | Endpoint WebSocket sur `/ws` |
| Racine runtime mutable | `autonovelwriter/runtime/` (ignoré par git) |

| Valeurs de lancement par défaut | Valeur |
|---|---|
| URL PWA | `http://127.0.0.1:8787/` |
| URL WebSocket | `ws://127.0.0.1:8787/ws` |
| Hôte/port backend | `127.0.0.1:8787` |

## Table des matières

- [Vue d’ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture en un coup d’œil](#-architecture-en-un-coup-dœil)
- [Structure du projet](#️-structure-du-projet)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Configuration](#️-configuration)
- [APIs backend clés](#-apis-backend-clés)
- [Chemins runtime](#-chemins-runtime)
- [Script de pipeline (artefact canonique)](#-script-de-pipeline-artefact-canonique)
- [Sorties du runner (stub de brouillon)](#-sorties-du-runner-stub-de-brouillon)
- [Tâches du runner (stub de lot)](#-tâches-du-runner-stub-de-lot)
- [Paramètres agent / garde Codex](#-paramètres-agent--garde-codex)
- [I18N PWA (langue de l’UI)](#-i18n-pwa-langue-de-lui)
- [Paramètres du roman (séparés de la langue UI)](#️-paramètres-du-roman-séparés-de-la-langue-ui)
- [Exemples](#-exemples)
- [Notes de développement](#️-notes-de-développement)
- [Notes de test](#-notes-de-test)
- [Contenu du dépôt](#-contenu-du-dépôt)
- [Dépannage](#-dépannage)
- [Feuille de route](#️-feuille-de-route)
- [Contribuer](#-contribuer)
- [Support](#-support)
- [Licence](#-licence)

## 📌 Vue d’ensemble

AutoNovelWriter fournit une couche d’orchestration locale pour :
- Éditer un script de pipeline canonique (`pipeline.script`) à la fois via texte source et interface blocs.
- Exécuter un backend reprenable avec curseur persistant et résultats d’actions.
- Gérer projets, matériaux, sorties, lots de tâches et modèles d’actions.
- Diffuser des mises à jour en direct via WebSocket (`/ws`) vers la PWA.

Le runtime mutable canonique est `autonovelwriter/runtime/` (contenu ignoré par git).

| Zone | Rôle |
|---|---|
| Écriture du pipeline | Éditer script canonique + UI blocs imbriqués depuis une source de vérité partagée |
| Exécution | Runner reprenable avec curseur persistant et résultats d’actions |
| Opérations projet | Matériaux, sorties, paramètres et activation de lots de tâches par projet |
| UX temps réel | Événements `/ws` pour statut/log/sorties/tâches/actions |

## ✨ Fonctionnalités

- Éditeur de pipeline type Scratch adossé à un script canonique + parseur/AST.
- APIs de contrôle du runner (`start/pause/resume/stop`) avec état reprenable.
- Conteneurs de contrôle de flux : `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Bibliothèque d’actions avec modèles par défaut + surcharges utilisateur via copy-on-edit.
- Surcharges des paramètres de roman par projet avec sémantique d’héritage.
- Flux de génération/index/détails/activation de lots de tâches pour `FOREACH_TASK`.
- Indexation des sorties et endpoints d’aperçu PDF du dernier roman.
- Dictionnaires i18n intégrés côté PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Scripts utilitaires tmux et pilote auto-dev Codex reprenable.

## 🧭 Architecture en un coup d’œil

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
| Python `3.11+` | Oui | Base recommandée |
| `pip` | Oui | Installer les dépendances backend |
| `tmux` | Non | Nécessaire pour le script de lancement multi-panneaux |
| `conda` | Non | Scripts utilitaires optionnels |
| `node` | Non | Optionnel pour exécuter le fichier de test PWA directement |

## 🚀 Installation

| Chemin | Idéal quand | Commande |
|---|---|---|
| Option A | Vous utilisez conda et voulez la configuration fournie par le dépôt | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Vous voulez configuration + exécution en une commande | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Vous préférez contrôler `pip` manuellement | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A : assistant Conda (recommandé pour ce dépôt)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Puis exécutez avec tmux :

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B : configuration + lancement en une seule fois

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Option C : installation manuelle via pip

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

Le backend sert aussi les ressources statiques PWA depuis `autonovelwriter/pwa/` par défaut, vous pouvez donc ouvrir :
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

Assistant d’environnement Conda :

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Le script pilote du dépôt (`scripts/auto-autonovelwriter-development.sh`) peut aussi démarrer une session tmux pendant l’auto-dev.

### Flux de travail type

1. Démarrer le backend (ou l’assistant tmux).
2. Ouvrir la PWA.
3. Éditer le pipeline via Blocs et/ou zone de texte script.
4. Valider/sauvegarder le pipeline.
5. Démarrer le runner et surveiller logs/statuts/événements.
6. Examiner les sorties générées et lots de tâches.

## ⚙️ Configuration

### Variables d’environnement

Utilisez `autonovelwriter/backend/.env.example` comme modèle. Variables clés utilisées par le backend/runtime :

- `AUTONOVELWRITER_RUNTIME_ROOT` (par défaut `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (par défaut `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (par défaut `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (drapeau CLI par défaut : `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (par défaut : parent de la racine du dépôt)
- `AUTONOVELWRITER_WRITER_SCRIPT` (par défaut `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (par défaut `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (par défaut `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (garde d’exécution agent, désactivé par défaut)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (surcharge optionnelle du binaire codex)

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
| Projets et paramètres de projet | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tâches | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Actions | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Sorties et aperçu du roman | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
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
  - `GET /api/pipeline/reference_writer` (lit et parse `../scripts/auto-xiyouzhiyuan-writer.sh` comme référence)
  - `POST /api/pipeline/reference_writer/load` (charge le résultat parsé dans le pipeline runtime ; ne modifie jamais le script source)
- Chat : `GET /api/chat/history`, `POST /api/chat/send`
- PDF du dernier roman :
  - `GET /api/novel/latest` (métadonnées)
  - `GET /api/novel/latest/pdf` (flux PDF inline pour le visualiseur)
- Contrôle du runner : `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Test agent (protégé) : `POST /api/agent/test` (exécute `codex --version` seulement si activé + garde d’environnement)

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
| `autonovelwriter/runtime/state/chat.sqlite3` | miroir chat sqlite (en plus de chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | pointeur persistant vers le projet actif |
| `autonovelwriter/runtime/tasks/` | fichiers de file de tâches |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | lots de tâches générés (ex. depuis `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | matériaux du projet (entrées) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | sorties du projet (brouillons/exports) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | surcharges des paramètres d’écriture par projet (ex. langue du roman) |
| `autonovelwriter/runtime/actions/defaults/` | modèles par défaut de la bibliothèque d’actions (considérés immuables) |
| `autonovelwriter/runtime/actions/user/` | modèles utilisateur de la bibliothèque d’actions (créés via copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | entrées chat miroir pour ingestion par le pipeline writer |

## 🧩 Script de pipeline (artefact canonique)

Le pipeline est représenté comme script formaté sur disque :
- `autonovelwriter/runtime/state/pipeline.script`

Le backend l’expose via `GET/POST /api/pipeline` sous forme de :
- `script` (canonique, lignes shell-like `STEP <type>` / `DISABLED <type>`)
- JSON `pipeline` (dérivé, liste aplatie pour rendu simple en blocs)
- `pipeline_ast` (dérivé, structure imbriquée utilisée pour boucles + UI d’indentation)

Le runner exécute des étapes dérivées du même parseur/AST v2, donc ce que la PWA affiche correspond à ce qui est exécuté.

Le flux de contrôle du runner supporte les conteneurs v2 :
- `ROUND <n>` répète ses enfants `n` fois.
- `FOREACH_TASK` exécute ses enfants une fois par tâche dans la liste active (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` exécute ses enfants une fois par entrée de la liste `payload.actions` de la tâche courante (prévu pour être imbriqué sous `FOREACH_TASK`).

Reprise :
- Le runner persiste un curseur d’exécution reprenable dans `autonovelwriter/runtime/state/runner_state.json`.
- Le curseur n’avance qu’après l’achèvement réussi d’un bloc (ainsi les redémarrages n’ignorent pas le travail inachevé).
- Si le script de pipeline canonique change (hash différent), le runner s’arrête et requiert un redémarrage (curseur invalidé).
- Le runner persiste des enregistrements `ActionResult` par étape dans `autonovelwriter/runtime/state/action_results.jsonl` et utilise un `exec_id` déterministe par étape pour éviter les doublons déjà commités après redémarrage.
- En exécution dans `FOREACH_ACTION`, les ActionResults incluent `action_index`, `action_id_ref` et `action_key`, et les variables incluent `prev` plus des scopes explicites `task.prev` vs `action.prev`.

Le script pipeline v2 supporte l’imbrication :
- `LOOP <n>` introduit un bloc de boucle.
- `ROUND <n>` introduit un bloc conteneur de rounds.
- `FOREACH_TASK` introduit un bloc conteneur par tâche.
- `FOREACH_ACTION` introduit un bloc conteneur par action (le runner itère sur `task.payload.actions`).
- `IF <expr>` introduit un bloc conditionnel (parse/rendu ; le runner exécute uniquement la branche then pour l’instant).
- `ELSE` introduit une branche alternative optionnelle sous un bloc `IF`.
- Les enfants sont indentés de 2 espaces par niveau.

Validation (sans persistance) :
- `POST /api/pipeline/validate` retourne un aperçu canonique plus `pipeline_ast`, avertissements et erreurs.

La PWA affiche le script dans une zone de texte (source de vérité) et rend les blocs imbriqués depuis `pipeline_ast`.
Si l’endpoint backend de validation est inaccessible, la PWA bascule vers un parseur local qui supporte les mêmes verbes v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Notes UI des blocs :
- Les compteurs de répétition `LOOP` et `ROUND` sont éditables en ligne dans la liste de blocs ; les modifications valides mettent immédiatement à jour la zone de texte du script canonique.
- La barre d’outils Blocs peut insérer des conteneurs `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` et `IF` sans édition manuelle du script (encapsule le bloc sélectionné ou ajoute un conteneur valide non vide).
- Les blocs peuvent être supprimés du canevas (bouton Delete par bloc ; touche `Delete` quand un bloc est sélectionné). Les suppressions de conteneurs remontent les enfants, et l’éditeur maintient des conteneurs non vides pour éviter des scripts invalides.
- Les blocs `IF` restent structurellement valides dans l’éditeur : `ELSE` ne peut pas persister hors d’un `IF`, et la branche then reste non vide.
- Les blocs `STEP` exposent les contrôles de la bibliothèque d’actions : sélecteur d’action, `Customize` (copie une action par défaut vers une action utilisateur et bascule), et `Edit` (modale Action Editor pour `name/tool/prompt/script`).

## 📝 Sorties du runner (stub de brouillon)

Quand le pipeline contient un bloc `STEP write`, le runner backend crée un fichier brouillon stub sous :
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Le backend émet aussi :
- Événement WS `output_created` avec `path` et `project_rel_path`
- Une ligne `log` `[output] created: ...`

La PWA inclut un panneau Outputs minimal qui liste les fichiers via `GET /api/outputs/index` et se rafraîchit sur `output_created`.

## 📦 Tâches du runner (stub de lot)

Quand le pipeline contient un bloc `STEP meta_tasks_generate`, le runner backend crée un lot de tâches stub sous :
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Le backend émet :
- Événement WS `tasks_batch_created` avec `batch_dir`, `tasks_jsonl`, et `task_count`
- Une ligne `log` `[tasks] created batch: ...`

La PWA inclut un panneau Task Batches minimal qui liste les lots via `GET /api/tasks/batches/index` et se rafraîchit sur `tasks_batch_created`.
Elle peut aussi afficher les détails d’un lot (`GET /api/tasks/batches/<batch_id>`) et activer un lot pour en faire la liste active de `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Paramètres agent / garde Codex

Le panneau Settings de la PWA persiste les paramètres agent via `/api/settings` dans `autonovelwriter/runtime/state/settings.json`.

Pour des raisons de sécurité, le backend ne lance pas le CLI `codex` sauf si les deux conditions suivantes sont vraies :
- `settings.agent.enabled=true` et `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` est défini dans l’environnement

Ne committez jamais de secrets. Utilisez `autonovelwriter/backend/.env.example` comme modèle pour les variables d’environnement locales.

## 🌐 I18N PWA (langue de l’UI)

La PWA dispose d’un système i18n intégré léger.

- Forcer la langue UI : ajoutez `?lang=<code>` à l’URL PWA (par exemple `?lang=ja`).
- Persisté par navigateur dans localStorage : `anw_lang`.
- Langues UI prises en charge : `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Les README localisés au niveau dépôt vivent actuellement dans `i18n/` et sont liés depuis l’unique ligne d’options de langue en haut de ce fichier.

| Fichiers README localisés (`i18n/`) | Statut |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Présents |

## 🖋️ Paramètres du roman (séparés de la langue UI)

Les préférences d’écriture de roman sont stockées dans les paramètres backend sous `settings.novel.*` dans :
- `autonovelwriter/runtime/state/settings.json`

Elles sont volontairement séparées de la langue UI de la PWA (`?lang=` / `anw_lang`).

Les surcharges par projet sont stockées dans :
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Champs globaux actuels (éditables dans la modale Settings de la PWA) :
- `settings.novel.language` (codes de type BCP-47 comme `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Champs actuels de surcharge au niveau projet (vide/non défini = hérite du global) :
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

### Exemple d’assistant d’automatisation scripté

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Notes de développement

### Flux pilote (auto-dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Auto-Dev Progress (Generated)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` exécute une boucle reprenable pilotée par Codex sur les tâches sous `references/autonovelwriter_dev/` et commit/push après chaque étape (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Contrôles utiles :
- Arrêter après la tâche en cours : `touch references/autonovelwriter_dev/STOP`
- Réinitialiser le suivi d’état (garde la file) : `scripts/auto-autonovelwriter-development.sh --reset-state`
- Démarrer une nouvelle session Codex : `scripts/auto-autonovelwriter-development.sh --new-session`
- Bonne pratique : exécuter dans une branche/worktree propre et surveiller `references/autonovelwriter_dev/state.tsv` avant de redémarrer

### Hypothèses opérationnelles

- Ce README suppose un développement local-first sous Linux/macOS avec `bash` et Python 3.11+.
- L’état runtime sous `autonovelwriter/runtime/` est mutable et censé ne pas être versionné.
- Le comportement pipeline décrit ici reflète l’implémentation actuelle du dépôt dans `autonovelwriter/backend/server.py` et `autonovelwriter/pwa/app.js`.

## 🧪 Notes de test

Il n’existe pas d’orchestrateur `Makefile`/`tox`/`npm test` à la racine de ce dépôt au moment de la rédaction.

Points d’entrée de test pratiques actuels :

| Zone | Point d’entrée |
|---|---|
| Parseur/AST backend | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Syntaxe foreach-action backend | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Sémantique runner backend | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Mise à jour bibliothèque d’actions backend | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| Comportement suppression AST PWA | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (run individual test files)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

Si vous ajoutez ou modifiez la sémantique du runner, la syntaxe du pipeline ou le comportement de la bibliothèque d’actions, mettez à jour les tests et les notes README/API dans le même changement.

## 📚 Contenu du dépôt

- `docs/autonovelwriter_spec.md` : spécification produit du contrôleur type Scratch (chat + dossier pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh` : auto-développe l’app AutoNovelWriter elle-même (boucle de tâches : `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md` : philosophie et exigences bilingues (EN/ZH) pour un agent d’auto-développement long-running et reprenable.
- `docs/ORDERING_RATIONALE.md` : exemple de justification d’ordonnancement des étapes pilotées par captures.
- `scripts-legacy/` : anciens scripts d’automatisation conservés pour référence mais non utilisés par AutoNovelWriter.
- `examples/ralph-wiggum-example.sh` : exemple d’assistant d’automatisation CLI Codex.

Notes développeur supplémentaires :
- Les tests backend sont dans `autonovelwriter/backend/tests/`.
- Un petit test de comportement PWA se trouve dans `autonovelwriter/pwa/tests/`.
- `i18n/` contient les README localisés du dépôt, tandis que les dictionnaires de traduction UI sont intégrés dans `autonovelwriter/pwa/app.js`.

## 🧯 Dépannage

| Symptôme | Vérifications |
|---|---|
| `tmux not found in PATH` | Installez tmux ou lancez les serveurs backend/statiques manuellement. |
| `conda not found in PATH` lors de l’usage des scripts `--env` | Installez Miniconda/Anaconda, ou ignorez conda et utilisez une installation `pip` manuelle. |
| La PWA ne peut pas se connecter au backend | Vérifiez adresse/port backend et endpoint WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` retourne gated/disabled | Vérifiez `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, et `AUTONOVELWRITER_ENABLE_CODEX=1` dans l’environnement. |
| Le runner pipeline s’arrête après édition du script | Comportement attendu ; le curseur est invalidé si le hash du script pipeline ne correspond plus, puis un redémarrage est requis. |
| La PWA statique sur `:5173` fonctionne mais les appels API échouent | Confirmez que le backend tourne sur `:8787` (ou mettez à jour les paramètres de cible app/backend en conséquence). |

## 🗺️ Feuille de route

- Finaliser et stabiliser les éléments restants de la file auto-dev (voir le bloc de progression généré ci-dessus).
- Étendre et synchroniser les variantes README i18n au niveau dépôt sous `i18n/`.
- Élargir la couverture de tests automatisés pour les cas limites du runner et les interactions PWA.
- Continuer d’améliorer la bibliothèque d’actions et les workflows d’itération tâches/actions.

## 🤝 Contribuer

Les contributions sont les bienvenues.

Recommandations pragmatiques pour ce dépôt :
- Commencez par `docs/autonovelwriter_spec.md` et `docs/auto-development-guide.md`.
- Conservez les mutations runtime sous `autonovelwriter/runtime/` (contenu ignoré par git), pas dans les fichiers suivis.
- Préférez des PR incrémentales avec des commandes d’exécution/test reproductibles.
- Si vous modifiez la sémantique du pipeline ou les contrats API, mettez à jour README et tests associés ensemble.

Remarque : aucun `CONTRIBUTING.md` dédié n’a été trouvé à la racine du dépôt au moment de cette version.

---

## ❤️ Support

| Donate | PayPal | Stripe |
|---|---|---|
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=ko-fi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 Licence

Le fichier/statut de licence n’est pas explicitement déclaré à la racine du dépôt dans ce contexte de brouillon.

Note d’hypothèse :
- Si vous souhaitez clarifier la redistribution open source, ajoutez un fichier `LICENSE` à la racine et mettez cette section à jour en conséquence.
