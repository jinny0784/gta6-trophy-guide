// Leonida Legend — hand-in program for the make.fun bounty
// gta6-trophy-guide-01 ("GTA VI Trophy Guide").
//
// What it does, in order:
//   1. Works out where this repository sits (the folder holding main.ts)
//      and where the hand-in goes: $MAKEFUN_OUTPUT_DIR when set, else
//      /output.
//   2. Makes sure the output folder exists, then clears its CONTENTS —
//      entry by entry, never the folder itself. The grader mounts /output
//      as a root-owned mount point, so deleting the directory (rmSync with
//      recursive on the folder) fails with EPERM; deleting the files and
//      subfolders inside it is always allowed.
//   3. Copies the whole app/ tree and the whole screenshots/ tree from the
//      repository into the output folder, byte for byte.
//   4. Writes dossier.json into the output folder with buildDossier from
//      the kit's vendor library, using the same caps the bounty's scorer
//      uses, so the dossier here is the dossier the scorer rebuilds and
//      compares.
//
// Node 22, standard library only, no network. Running it twice over the
// same repository writes the same bytes: the copies are plain file copies
// and buildDossier is deterministic.

import {
  cpSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Create the output folder if needed, then empty it entry by entry. A
// stale file from an earlier run must never slip into the hand-in — but
// the folder itself is never removed (see the note at the top).
mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  rmSync(join(outputDir, entry), { recursive: true, force: true });
}

// The app itself and the screenshots its maker took.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), {
  recursive: true,
});

// The dossier the judge reads, built from exactly what was just copied.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

const dossierBytes =
  typeof dossier === 'string'
    ? Buffer.byteLength(dossier, 'utf8')
    : dossier.length;
console.log(
  `handed in app/ and screenshots/ to ${outputDir} with dossier.json (${dossierBytes} bytes)`,
);
