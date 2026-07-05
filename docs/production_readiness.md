# Production Readiness

**Last updated:** Phase 4 — Supabase-ready backend & admin review mock  
**QA status:** `npm run qa` (integrity + policy + browser)

---

## Ready today (local demo)

| Area | Status |
|------|--------|
| Public app (graph, story, search, surahs, study) | ✅ Works offline with JSON |
| Content governance UI (`isFinalContent`, badges, disclaimer) | ✅ Enforced |
| Data integrity checks | ✅ 9/9 pass |
| Expanded prototype dataset | ✅ v0.3.0 seed |
| Admin review mock screen | ✅ `#admin-review` |
| Repository factory + env config | ✅ Local default, Supabase fallback |

---

## Not ready for public production

| Gap | Risk | Required before launch |
|-----|------|------------------------|
| 201 pending / needs_source records | Draft shown with badges but volume too high for «trusted» product | Scholar review + approve core paths |
| Supabase not wired to live data | No persistent reviews | Complete migration plan Phase B–D |
| Mock admin actions | Reviews lost on refresh | Wire `submitReviewAction()` + auth |
| No licensed full ayah text | Reference-only keys | Import Tanzil / official text |
| Prototype ayah round-robin | Some events share refs incorrectly | Per-event scholarly mapping |
| No RLS / auth on admin | Anyone with URL can open mock admin | Gate `#admin-review` behind auth |
| `ibn_kathir_summary` not approved | Must not show as verified tafsir | License + scholar review |
| Single static deploy | No CI/CD to Supabase | Pipeline + staging environment |

---

## Environment matrix

| `VITE_DATA_MODE` | Supabase creds | Behavior |
|------------------|----------------|----------|
| `local` | ignored | JSON seed (default) |
| `supabase` | missing | **Fallback to local** (no crash) |
| `supabase` | present | Placeholder repo (local seed until DB populated) |

---

## Content counts (v0.3.0)

| review_status | Approx. count | Public «final» (`isFinalContent`) |
|---------------|-------------:|----------------------------------:|
| approved | 59 | 59 (where source_status ≠ none) |
| pending | 200 | 0 |
| needs_source | 1 | 0 |

---

## Pre-launch checklist

### Data & scholarship
- [ ] Core prophets (yusuf, musa, nuh, muhammad) fully reviewed
- [ ] Event summaries cite Quran + approved tafsir sources
- [ ] Ayah mappings verified per event (not round-robin)
- [ ] Network conclusions approved or removed

### Engineering
- [ ] Supabase populated from seed
- [ ] `supabaseRepository.js` reads live tables
- [ ] Review actions persist + audit trail
- [ ] Admin behind Supabase Auth
- [ ] RLS: public read approved only (optional strict mode)
- [ ] `npm run qa` green on staging with `VITE_DATA_MODE=supabase`

### Legal & content
- [ ] Licensed Quran text
- [ ] Tafsir source licenses documented
- [ ] Disclaimer retained: «هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.»

### Operations
- [ ] Staging + production Supabase projects
- [ ] Backup strategy for content_reviews audit
- [ ] Reviewer onboarding doc (`docs/admin_review_workflow.md`)

---

## Recommended release strategy

1. **Soft launch:** public app in `local` or read-only Supabase with large pending set — badges + disclaimer prominent.
2. **Beta:** approved subset only (strict public filter) via RLS or `onlyApproved` search flag.
3. **Production:** >90% of surfaced story paths approved; admin workflow live; licensed ayah text.

---

## Commands

```bash
cp .env.example .env   # optional for future Vite build
npm run dev            # local demo
npm run qa             # integrity + policy + browser (includes admin screen)
```
