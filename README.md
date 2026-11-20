# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jinny0784/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jinny0784/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline trophy guide and checklist tracker for
Grand Theft Auto VI. All **55 trophies** (1 Platinum, 2 Gold, 6 Silver,
46 Bronze, 28 of them hidden) with the exact official names, descriptions
and grades, a plain-words guide for every trophy, spoiler protection, and
a progress checklist that lives in your browser.

## The app

Open `app/index.html` and you get:

- **Progress header** — overall percentage, trophies earned out of 55, and
  a per-grade breakdown (Platinum / Gold / Silver / Bronze) with a neon
  progress bar.
- **Trophy cards** — grade icon and pill, category, official description,
  and an own-words "How to unlock" guide for every trophy.
- **Spoiler blur** — the 28 hidden trophies show as "Hidden Trophy" with
  their descriptions and guides blurred until you click *Reveal spoiler*.
- **Filters** — free-text search plus filters for grade, category,
  hidden/visible, done/to-do, and a missable-only view.
- **Checklist** — tick trophies off as you earn them; state is stored in
  `localStorage`, so progress survives closing the tab.
- **Export / import** — download your progress as JSON and restore it on
  another browser or machine; a reset button clears everything.
- **Platinum roadmap** — a 6-step route through the game (story first,
  then strands, activities, crime, collecting, and the 100% push) at
  roughly 150–200 hours in a single playthrough.

The one trap is called out everywhere it matters: **Positive Mental
Attitude** is the game's only missable trophy — meditate at all 18 spots
as you discover them, and never walk away before the final "zen"
animation plays.

The app is fully offline: plain HTML, CSS and JavaScript with no external
resources, fonts or trackers.

## Data

`app/data/trophies.json` holds the full list: name, official description,
grade, hidden flag, category, a missable flag (set on exactly one trophy),
and a guide written for this app. Names, grades, hidden status and
descriptions were cross-checked across at least two independent published
lists:

- Push Square — *GTA 6 Trophy Guide & Roadmap*
- Of Zen and Computing — *GTA 6 Trophy List: All 55 Trophies*
- EGamers.io — *GTA 6 Trophy List: All 55 Trophies and Achievements*
- KeenGamer — *GTA 6 Trophy Guide & Platinum Roadmap*
- GamesFuze — *GTA 6 Trophy List: All 55 Trophies & Achievements*

## Run it

Serve the `app/` folder with any static file server and open it in a
browser, for example:

```sh
npx serve app
```

(Any static server works; the app fetches `data/trophies.json` relative to
the page, which some browsers refuse from a bare `file://` URL.)

## Hand-in program

`main.ts` is the bounty's hand-in entry point (Node 22, standard library
only). It copies `app/` and `screenshots/` into `$MAKEFUN_OUTPUT_DIR`
(default `/output`) and writes a deterministic `dossier.json` built with
the kit's `vendor/makefun-frontend.ts`:

```sh
MAKEFUN_OUTPUT_DIR=./out node main.ts
```

It clears the output folder's *contents* entry by entry rather than
deleting the folder itself, so it is safe to run where the output
directory is a mount point.

## Screenshots

`screenshots/` holds four captures of the running app: the full checklist,
the progress header with trophies ticked off, the missable trophy's guide
card in detail, and a hidden-only filtered view with spoiler blur on.

## Licence

MIT — see `LICENSE`. Leonida Legend is a fan-made tool and is not
affiliated with Rockstar Games or Take-Two Interactive.

<sub>Entered on [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
