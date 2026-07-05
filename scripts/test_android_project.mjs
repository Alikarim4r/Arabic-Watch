#!/usr/bin/env node
/**
 * Quick checks for Capacitor Android project scaffolding.
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.log('FAIL', msg);
    failed += 1;
  } else {
    console.log('PASS', msg);
  }
}

const capConfig = join(root, 'capacitor.config.json');
assert(existsSync(capConfig), 'capacitor.config.json exists');
if (existsSync(capConfig)) {
  const cfg = JSON.parse(readFileSync(capConfig, 'utf8'));
  assert(cfg.webDir === 'src', 'capacitor webDir is src');
  assert(cfg.appId === 'com.quranstory.universe', 'capacitor appId');
}

assert(existsSync(join(root, 'android/app/src/main/AndroidManifest.xml')), 'AndroidManifest.xml');
assert(existsSync(join(root, 'android/app/build.gradle')), 'android app build.gradle');
assert(existsSync(join(root, 'docs/android_app_guide.md')), 'android_app_guide.md');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
assert(typeof pkg.scripts['android:sync'] === 'string', 'android:sync npm script');
assert(typeof pkg.scripts['android:build'] === 'string', 'android:build npm script');

const manifest = readFileSync(join(root, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
assert(manifest.includes('android.permission.INTERNET'), 'INTERNET permission');
assert(manifest.includes('supportsRtl="true"'), 'RTL support enabled');

process.exit(failed ? 1 : 0);
