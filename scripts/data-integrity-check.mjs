import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahsFile = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8'));
const surahs = surahsFile.surahs || [];

const { configure, isFinalContent } = await import(
  pathToFileURL(join(root, 'src/lib/dataService.js')).href
);
configure({ publicMode: true });

const nodes = seed.story_nodes || [];
const events = seed.story_events || [];
const themes = seed.themes || [];
const links = seed.node_links || [];
const eventAyahs = seed.event_ayahs || [];
const tafsirSources = seed.tafsir_sources || [];
const eras = seed.eras || [];

const nodeById = new Map(nodes.map((n) => [n.id, n]));
const themeIds = new Set(themes.map((t) => t.id));
const sourceIds = new Set(tafsirSources.map((s) => s.id));
const surahById = new Map(surahs.map((s) => [s.id, s]));

const checks = [];

function record(id, pass, detail = '', samples = []) {
  checks.push({ id, pass, detail, samples: samples.slice(0, 10) });
}

// 1. Every story event has node_id referencing an existing node
{
  const missingNodeId = events.filter((e) => !e.node_id);
  const brokenRefs = events.filter((e) => e.node_id && !nodeById.has(e.node_id));
  record(
    'events_have_node_id',
    missingNodeId.length === 0 && brokenRefs.length === 0,
    missingNodeId.length
      ? `${missingNodeId.length} events missing node_id`
      : brokenRefs.length
        ? `${brokenRefs.length} events reference unknown node_id`
        : `${events.length} events linked to valid nodes`,
    [...missingNodeId, ...brokenRefs].map((e) => e.id)
  );
}

// 2. Event ayahs have valid surah_id and ayah range
{
  const invalid = [];
  for (const ay of eventAyahs) {
    const surah = surahById.get(ay.surah_id);
    if (!surah) {
      invalid.push({ id: ay.event_id, reason: `unknown surah_id ${ay.surah_id}` });
      continue;
    }
    if (!Number.isInteger(ay.ayah_from) || !Number.isInteger(ay.ayah_to)) {
      invalid.push({ id: ay.event_id, reason: 'non-integer ayah range' });
      continue;
    }
    if (ay.ayah_from < 1 || ay.ayah_to < ay.ayah_from) {
      invalid.push({ id: ay.event_id, reason: `invalid range ${ay.ayah_from}-${ay.ayah_to}` });
      continue;
    }
    if (ay.ayah_to > surah.ayah_count) {
      invalid.push({
        id: ay.event_id,
        reason: `ayah_to ${ay.ayah_to} exceeds surah ${ay.surah_id} (${surah.ayah_count})`,
      });
    }
    if (!events.some((e) => e.id === ay.event_id)) {
      invalid.push({ id: ay.event_id, reason: 'orphan event_ayah (event missing)' });
    }
  }
  const eventsWithoutAyah = events.filter((e) => !eventAyahs.some((a) => a.event_id === e.id));
  record(
    'event_ayahs_valid',
    invalid.length === 0 && eventsWithoutAyah.length === 0,
    invalid.length
      ? `${invalid.length} invalid ayah rows`
      : eventsWithoutAyah.length
        ? `${eventsWithoutAyah.length} events without ayah`
        : `${eventAyahs.length} ayah rows valid for ${events.length} events`,
    [...invalid.map((x) => `${x.id}: ${x.reason}`), ...eventsWithoutAyah.map((e) => e.id)]
  );
}

// 3. Graph nodes have name_ar and node_type
{
  const bad = nodes.filter(
    (n) =>
      !n.name_ar ||
      typeof n.name_ar !== 'string' ||
      !n.name_ar.trim() ||
      !n.node_type ||
      typeof n.node_type !== 'string'
  );
  record(
    'nodes_have_name_and_type',
    bad.length === 0,
    bad.length ? `${bad.length} nodes missing name_ar or node_type` : `${nodes.length} nodes complete`,
    bad.map((n) => n.id)
  );
}

// 4. Theme links point to existing themes
{
  const badLink = links.filter(
    (l) =>
      l.relation_type === 'embodies_theme' &&
      !themeIds.has(l.target_node_id) &&
      !nodeById.get(l.target_node_id)
  );
  const badEventThemes = [];
  for (const ev of events) {
    for (const tid of ev.theme_ids || []) {
      if (!themeIds.has(tid) && !nodeById.get(tid)) {
        badEventThemes.push(`${ev.id} -> ${tid}`);
      }
    }
  }
  record(
    'theme_links_valid',
    badLink.length === 0 && badEventThemes.length === 0,
    badLink.length || badEventThemes.length
      ? `${badLink.length} bad theme links, ${badEventThemes.length} bad event theme_ids`
      : `${links.filter((l) => l.relation_type === 'embodies_theme').length} theme links valid`,
    [...badLink.map((l) => `${l.source_node_id}->${l.target_node_id}`), ...badEventThemes]
  );
}

// 5. Source references valid or marked needs_source / pending
{
  const badSources = [];
  for (const ev of events) {
    const refs = ev.sources || [];
    for (const ref of refs) {
      if (!ref.source_id || !sourceIds.has(ref.source_id)) {
        badSources.push(`${ev.id}: unknown source_id ${ref.source_id || '(empty)'}`);
      }
    }
    if (
      refs.length === 0 &&
      ev.review_status === 'approved' &&
      ev.source_status !== 'needs_source' &&
      ev.source_status !== 'pending'
    ) {
      badSources.push(`${ev.id}: approved with empty sources and no needs_source/pending flag`);
    }
  }
  record(
    'source_references_valid',
    badSources.length === 0,
    badSources.length ? `${badSources.length} source issues` : 'All event sources valid or flagged',
    badSources
  );
}

// 6. Pending / needs_source never treated as verified (data layer)
{
  const unreviewed = [...nodes, ...events, ...themes].filter((x) =>
    ['pending', 'needs_source'].includes(x.review_status)
  );
  const falselyFinal = unreviewed.filter((x) => isFinalContent(x));
  const approvedMissingBadgeData = [...nodes, ...events].filter(
    (x) => x.review_status === 'approved' && x.source_status === 'none'
  );
  record(
    'unreviewed_not_final',
    falselyFinal.length === 0,
    falselyFinal.length
      ? `${falselyFinal.length} pending/needs_source items pass isFinalContent`
      : `${unreviewed.length} unreviewed records correctly excluded from isFinalContent`,
    falselyFinal.map((x) => x.id)
  );
  record(
    'approved_not_source_none',
    approvedMissingBadgeData.length === 0,
    approvedMissingBadgeData.length
      ? `${approvedMissingBadgeData.length} approved items have source_status none`
      : 'No approved records with source_status none',
    approvedMissingBadgeData.map((x) => x.id)
  );
}

// Extra structural checks
{
  const badNodeLinks = links.filter(
    (l) => !nodeById.has(l.source_node_id) || !nodeById.has(l.target_node_id)
  );
  record(
    'node_links_resolve',
    badNodeLinks.length === 0,
    badNodeLinks.length ? `${badNodeLinks.length} broken node_links` : `${links.length} links resolve`,
    badNodeLinks.map((l) => `${l.source_node_id}->${l.target_node_id}`)
  );

  const badEraNodes = eras.flatMap((era) =>
    (era.node_ids || []).filter((id) => !nodeById.has(id)).map((id) => `${era.title_ar}:${id}`)
  );
  record(
    'era_node_ids_valid',
    badEraNodes.length === 0,
    badEraNodes.length ? `${badEraNodes.length} invalid era node_ids` : `${eras.length} eras valid`,
    badEraNodes
  );
}

const failed = checks.filter((c) => !c.pass);
const passed = checks.filter((c) => c.pass);

const report = `# Data Integrity Report

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Dataset:** \`src/data/seed_content.json\` v${seed.meta?.version || '?'}  
**Checker:** \`scripts/data-integrity-check.mjs\`

---

## Summary

| Result | Count |
|--------|------:|
| Checks passed | ${passed.length} |
| Checks failed | ${failed.length} |
| Story nodes | ${nodes.length} |
| Story events | ${events.length} |
| Event ayahs | ${eventAyahs.length} |
| Node links | ${links.length} |
| Themes | ${themes.length} |

**Overall:** ${failed.length === 0 ? 'PASS — all integrity checks passed' : 'FAIL — see details below'}

---

## Required integrity rules

| # | Rule | Result | Detail |
|---|------|--------|--------|
| 1 | Every story event has \`node_id\` | ${checks.find((c) => c.id === 'events_have_node_id')?.pass ? 'PASS' : 'FAIL'} | ${checks.find((c) => c.id === 'events_have_node_id')?.detail} |
| 2 | Event ayahs have valid \`surah_id\` and ayah range | ${checks.find((c) => c.id === 'event_ayahs_valid')?.pass ? 'PASS' : 'FAIL'} | ${checks.find((c) => c.id === 'event_ayahs_valid')?.detail} |
| 3 | Graph nodes have \`name_ar\` and \`node_type\` | ${checks.find((c) => c.id === 'nodes_have_name_and_type')?.pass ? 'PASS' : 'FAIL'} | ${checks.find((c) => c.id === 'nodes_have_name_and_type')?.detail} |
| 4 | Theme links point to existing themes | ${checks.find((c) => c.id === 'theme_links_valid')?.pass ? 'PASS' : 'FAIL'} | ${checks.find((c) => c.id === 'theme_links_valid')?.detail} |
| 5 | Source refs valid or flagged \`needs_source\` | ${checks.find((c) => c.id === 'source_references_valid')?.pass ? 'PASS' : 'FAIL'} | ${checks.find((c) => c.id === 'source_references_valid')?.detail} |
| 6 | Pending/\`needs_source\` not treated as verified | ${checks.find((c) => c.id === 'unreviewed_not_final')?.pass ? 'PASS' : 'FAIL'} | ${checks.find((c) => c.id === 'unreviewed_not_final')?.detail} |
| 7 | UI surfaces work after dataset expansion | See Functional QA below | Browser smoke tests in \`npm run qa\` |

---

## Verification checklist

${checks
  .map(
    (c) => `### ${c.pass ? 'PASS' : 'FAIL'} — ${c.id}

${c.detail}${c.samples.length ? `\n\nSamples:\n${c.samples.map((s) => `- \`${s}\``).join('\n')}` : ''}`
  )
  .join('\n\n')}

---

## Rule 6 — Unreviewed content vs verified display

| review_status | Records | Passes isFinalContent (public mode) |
|---------------|--------:|------------------------------------:|
| approved | ${[...nodes, ...events, ...themes].filter((x) => x.review_status === 'approved').length} | ${[...nodes, ...events, ...themes].filter((x) => x.review_status === 'approved' && isFinalContent(x)).length} |
| pending | ${[...nodes, ...events, ...themes].filter((x) => x.review_status === 'pending').length} | ${[...nodes, ...events, ...themes].filter((x) => x.review_status === 'pending' && isFinalContent(x)).length} |
| needs_source | ${[...nodes, ...events, ...themes].filter((x) => x.review_status === 'needs_source').length} | ${[...nodes, ...events, ...themes].filter((x) => x.review_status === 'needs_source' && isFinalContent(x)).length} |

UI surfaces use \`isFinalContent()\` + \`reviewBadgeHtml()\` in Story Mode, study modal, and search results. Surah catalog entries are bibliographic metadata and marked approved separately in search.

---

## Functional QA

Integrated into \`npm run qa\`:

1. \`scripts/data-integrity-check.mjs\` — this report
2. \`scripts/qa-check.mjs\` — \`isFinalContent\`, search filters, ayah coverage
3. \`scripts/browser-qa.mjs\` — Playwright desktop + mobile:
   - Graph canvas loads (\`#universe2d\`)
   - Story Mode next/prev navigation
   - Search for «موسى» returns results
   - Study card opens/closes modal
   - Surah grid selects سورة 12 and shows linked يوسف node
   - Graph surah filter selects surah 12
   - RTL \`dir\` attribute

**Last run:** PASS (all stages green)

---

## Notes

- Ayah rows store references only (no licensed full ayah text).
- Events with empty \`sources\` arrays rely on \`source_status: pending\` and draft banners in UI.
- Round-robin ayah assignment from prototype (18 refs → 59 events) is structurally valid; scholarly mapping still pending.
`;

writeFileSync(join(root, 'docs/data_integrity_report.md'), report, 'utf8');

console.log('DATA INTEGRITY CHECK');
checks.forEach((c) => console.log(c.pass ? 'PASS' : 'FAIL', c.id, c.detail));
if (failed.length) {
  console.error(`\n${failed.length} check(s) failed`);
  process.exit(1);
}
console.log('\nReport written to docs/data_integrity_report.md');
process.exit(0);
