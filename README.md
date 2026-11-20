# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jinny0784/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jinny0784/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline trophy guide and progress tracker for Grand Theft Auto VI on PlayStation 5. All 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden) with their official names, descriptions and grades as PlayStation publishes them, a guide in our own words for every trophy with its sources named, a six-step platinum roadmap, the missable trophy flagged in red, and a working tracker: checklist with per-trophy counters, filters by kind, grade and status, spoiler protection that keeps hidden trophies blurred until they are earned, and progress saved in the browser with export/import. It runs entirely from static files — no build step, no network.

The official list is as Exophase and PSNProfiles published it; the guides draw on those lists and on the published guides of Output Lag, PowerPyx and Push Square, each cited beside the trophy it informs. A fan-made guide: not affiliated with Rockstar Games or PlayStation, and it uses no official artwork or logos.

## Run it

Serve the `app/` folder with any static file server and open it in a desktop browser:

```sh
python3 -m http.server 8080 --directory app
# then open http://localhost:8080
```

To hand the entry in (copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/index.html` — the guide's single page: checklist, roadmap and missables views, detail dialog
- `app/app.js`, `app/render.js`, `app/filters.js`, `app/store.js` — loading, rendering, filtering and the localStorage tracker with export/import
- `app/data/trophies.json` — the 55 trophies with official data, guides, sources and the roadmap
- `screenshots/` — four captures of the running app
- `main.ts` — the entry program; `vendor/makefun-frontend.ts` is the kit's dossier library, unchanged

---

<sub>Entered on [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

## Round 2 fix
The hand-in program now clears the output folder entry by entry instead of deleting the folder itself, so it runs cleanly inside the grader's read-only container where the output directory is a root-owned mount point.
