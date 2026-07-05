# Original Prototype Parity Report

Comparison between `quran_story_universe_10_10_final.html` (original) and the refactored `/src` project (pre-parity pass).

## Summary

| Dimension | Original | Refactored (before parity) | Target after parity |
|-----------|----------|----------------------------|---------------------|
| Layout | Single-page scroll, 8 sections | Tab-based views | Single-page sections + sticky nav |
| Typography | Cairo + Amiri | Reem Kufi + Cormorant | Cairo + Amiri (restored) |
| Visual richness | Hero, glass, tags, glow graph | Simpler panels | Restore premium styling |
| Content trust | Hard-coded tafsir snippets | JSON + review badges | Keep trust model, richer UI |
| Data | Embedded RAW array | JSON + repository | Keep JSON layer |

---

## Features preserved (refactored)

- [x] Canvas physics graph concept
- [x] Story Mode with event navigation
- [x] Search with filters
- [x] Surah grid
- [x] Study modal entry points
- [x] RTL Arabic-first layout
- [x] Dark/gold luxury direction
- [x] Review status badges (new — not in original)
- [x] Source policy + disclaimer (new — not in original)
- [x] JSON data layer + repository (new — not in original)
- [x] Arabic normalization in search (new — stronger than original)

---

## Features missing or weaker

### Hero & global chrome

| Item | Original | Refactored gap |
|------|----------|----------------|
| Full-viewport hero | Bismillah, gradient H1, subtitle, CTA buttons | Simple title + tab nav only |
| Animated stars canvas | 135 particles on hero | Static CSS dots only |
| Stats row | prophets / 114 surahs / themes / ayah refs | Not shown |
| Sticky nav | Brand + section anchor links | Tab switcher only |
| Methodology section | 3 glass cards | Absent |
| Era timeline | Horizontal era path + detail card | Absent |
| Study cards grid | All prophets as cards | Absent as landing section |
| Footer | Brand + disclaimer line | Absent |

### Graph (`#universe`)

| Item | Original | Refactored gap |
|------|----------|----------------|
| Height | 700px glass wrap | ~420px |
| Controls overlay | +/- zoom, reset, pause (top-right) | Toolbar above canvas |
| Legend overlay | Color dots bottom-right | Absent |
| Mode badge | "Canvas Physics Graph" | Absent |
| Node glow | `shadowBlur` per type color | Flat fills |
| Coordinate system | World space + pan offset + scale | Simpler pan/zoom |
| Node click | Opens study / surah / theme search | Side panel only |
| Label rendering | Full label above node | First word only |
| Type colors | gold/blue/green/rose/violet | Similar but muted |

### Story Mode (`#story`)

| Item | Original | Refactored gap |
|------|----------|----------------|
| Prophet selector | Dropdown + next/prev | Sidebar chips |
| Step buttons | Primary/active styled list | Timeline list (OK) |
| Visual stage | Large icon + float animation + theme tags | Text-only detail panel |
| Open study CTA | Prominent in visual stage | Present but less dramatic |

### Search (`#search`)

| Item | Original | Refactored gap |
|------|----------|----------------|
| Results layout | Card grid (auto-fill 260px) | Vertical list |
| Colored type tags | blue/green/violet tags | Generic chips |
| AI chat analyzer | Rule-based Q&A | Absent (intentionally — no fake tafsir) |
| Theme filter dropdown | Populated from all themes | Partial |

### Surahs (`#surahs`)

| Item | Original | Refactored gap |
|------|----------|----------------|
| Grid density | 114 compact cells (82px min) | Sparse subset |
| Detail panel | Linked prophets below grid | Modal only |
| Active state | Highlight selected surah | None |

### Study modal

| Item | Original | Refactored gap |
|------|----------|----------------|
| Two-column layout | Events timeline + surahs/people/places | Single column minimal |
| Ayah blocks | Arabic quote + reference + play button | Reference numbers only |
| Tafsir comparison | 4 fake summaries | Correctly removed — replaced with sources |
| Network conclusion | Custom paragraph per prophet | Absent |
| Story Mode jump | Button from modal | Partial |

---

## Visual differences

1. **Background**: Original uses `#02040a` ellipse gradient + subtle star field; refactored used bluer multi-radial gradient.
2. **Glass panels**: Original `--panel:rgba(12,18,32,.84)` + `blur(18px)` + `--r:24px`; refactored smaller radius and lighter blur.
3. **Buttons**: Original `.btn.primary` gold gradient with hover lift; refactored uniform pill buttons.
4. **Tags**: Original colored tags (`.tag.blue/green/rose/violet`); refactored neutral chips/badges.
5. **Headings**: Original Amiri clamp up to 110px hero; refactored smaller Reem Kufi titles.
6. **Section spacing**: Original `padding:76px 0` per section; refactored compact 18px gaps.

---

## Behavior differences

1. **Navigation**: Original scroll-to-hash; refactored destroys/recreates views on tab change.
2. **Graph filter**: Refactored adds explicit filter dropdowns (improvement); original filters via click actions.
3. **Search**: Refactored Arabic normalization (improvement); original simple `includes`.
4. **Public trust**: Refactored hides final status unless approved (improvement); original shows all tafsir-like text as final.
5. **AI chat**: Original simulates answers — **not ported**; replaced with source-backed study only.

---

## Recommended fixes (implemented in parity pass)

### P0 — Visual identity

- [x] Restore Cairo + Amiri fonts and original CSS tokens
- [x] Add hero with animated stars canvas + stats
- [x] Add sticky nav, methodology, era timeline, study cards, footer
- [x] Apply glass/card/tag styling across sections

### P1 — Feature parity

- [x] Upgrade graph: glow nodes, overlay controls, legend, 700px wrap, world coordinates
- [x] Upgrade Story Mode: visual stage with float animation + selector row
- [x] Search: card grid + colored tags (no AI chat — replaced with search guidance)
- [x] Surahs: full 114 grid + detail panel
- [x] Study modal: two-column rich layout with events, ayah refs, sources, review badges

### P2 — Keep architectural wins

- [x] Keep JSON/repository — no RAW embed in UI
- [x] Keep review_status / source_status / disclaimer
- [x] Do not restore fake tafsir blocks — use approved sources only
- [x] Add `eras` to seed JSON for timeline section

### P3 — Future

- [ ] Licensed full ayah text in modal (not invented snippets)
- [ ] Supabase-backed study rooms
- [ ] Optional educational Q&A with explicit "draft" labeling and citations only

---

## Post-implementation verification checklist

- [x] Hero stars animate (respect reduced-motion)
- [x] Graph zoom/reset/pause match original feel
- [x] Story visual stage animates
- [x] 114 surahs render
- [x] Study modal opens from graph, cards, story
- [x] No console errors (verified locally)
- [x] Disclaimer visible globally
