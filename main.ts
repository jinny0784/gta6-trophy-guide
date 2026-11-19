// Leonida Legend — GTA VI trophy guide & tracker: entry program for make.fun.
//
// Running `node main.ts` copies this repository's app/ and screenshots/ into
// the output directory (MAKEFUN_OUTPUT_DIR when set, else /output) and writes
// the entry's dossier.json there with the kit's own library, so the dossier
// the grader rebuilds from the same files matches byte for byte.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a re-run writes the same bytes.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`dossier.json written to ${outputDir} (${dossier.length} bytes)`);
