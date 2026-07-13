#!/usr/bin/env node
// Build & obfuscate the UEDA EX Chrome extension.
// Reads extension-src/, obfuscates every .js (safe MV3 settings — no eval,
// no selfDefending), and writes the packaged zip to public/ueda-ex.zip.
//
// Any future edit to the extension MUST run this script so the shipped zip
// stays obfuscated. Do not zip extension-src/ directly.

import { readdirSync, statSync, mkdirSync, rmSync, cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { execSync } from 'node:child_process';
import JavaScriptObfuscator from 'javascript-obfuscator';

const ROOT = process.cwd();
const SRC = join(ROOT, 'extension-src');
const OUT = join(ROOT, '.ext-build');
const ZIP = join(ROOT, 'public', 'ueda-ex.zip');

// Files to skip obfuscation (already minified vendor libs — reprocessing
// them wastes time and can break them).
const SKIP_OBFUSCATION = new Set([
  'jszip.min.js',
]);

// MV3-safe obfuscation options:
// - no eval / no Function() (CSP-safe for service worker & extension pages)
// - no selfDefending / no debugProtection (those use eval or timers that
//   crash in content scripts)
// - stringArray with base64 encoding is pure string ops, safe everywhere
const OBFUSCATE_OPTS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.6,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false, // content scripts share globals — leave alone
  selfDefending: false, // uses eval → breaks under MV3 CSP
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.8,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
  target: 'browser',
};

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

console.log('[ext] cleaning', OUT);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

console.log('[ext] copying source →', OUT);
cpSync(SRC, OUT, { recursive: true });

// Do not ship the source-side package.json (npm metadata, not extension config)
const srcPkg = join(OUT, 'package.json');
if (existsSync(srcPkg)) rmSync(srcPkg);

const files = walk(OUT).filter((f) => extname(f) === '.js');
console.log(`[ext] obfuscating ${files.length} js files`);

for (const file of files) {
  const rel = relative(OUT, file);
  if (SKIP_OBFUSCATION.has(rel) || SKIP_OBFUSCATION.has(rel.split(/[\\/]/).pop())) {
    console.log('  skip', rel);
    continue;
  }
  const code = readFileSync(file, 'utf8');
  try {
    const result = JavaScriptObfuscator.obfuscate(code, OBFUSCATE_OPTS).getObfuscatedCode();
    writeFileSync(file, result);
    console.log('  ok  ', rel);
  } catch (e) {
    console.error('  FAIL', rel, e.message);
    process.exit(1);
  }
}

console.log('[ext] zipping →', ZIP);
rmSync(ZIP, { force: true });
mkdirSync(join(ROOT, 'public'), { recursive: true });
execSync(`nix run nixpkgs#zip -- -r "${ZIP}" .`, { cwd: OUT, stdio: 'inherit' });

console.log('[ext] done:', ZIP);
