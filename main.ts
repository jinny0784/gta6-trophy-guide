// Leonida Legend — GTA VI trophy guide & tracker, entry program for make.fun.
// Round 2 fixes the grader run: the output directory is cleared entry by
// entry and never removed itself (see the note at the clearing step below).
//
// What this program does, in order:
//   1. Resolves the repository root (the folder holding this file) and the
//      output directory ($MAKEFUN_OUTPUT_DIR when set, else /output).
//   2. Creates the output directory if needed and empties it, entry by entry.
//   3. Copies the app/ tree and the screenshots/ tree into the output.
//   4. Builds dossier.json from the copied tree with the kit's buildDossier
//      and writes it into the output folder.
//
// Node 22, standard library only, no network. Running it twice over the same
// repository writes the same bytes.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Create the output directory if it does not exist yet, then clear its
// contents entry by entry. The directory itself must never be removed: in
// the grader's container /output is a mount point owned by root, and this
// program runs as an unprivileged user, so removing the directory fails
// with EPERM. Deleting each entry inside it works fine.
mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  rmSync(join(outputDir, entry), { recursive: true, force: true });
}

// The app itself and the screenshots taken of it.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

// The dossier the judge reads, built from exactly what was just copied,
// under the same caps the bounty's scorer uses.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log(`dossier.json written to ${join(outputDir, 'dossier.json')} (${dossier.length} bytes)`);
