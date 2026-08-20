# Staging Verification Checklist

Use after completing [staging_supabase_setup.md](./staging_supabase_setup.md).

## Automated smoke

```bash
# Offline QA (no credentials)
npm run qa

# Live staging (requires .env.staging)
npm run qa:staging
```

`qa:staging` checks (anon key):

- Required tables/views reachable
- Anonymous reads do not expose non-final `story_events`
- Anonymous `review_actions` insert blocked
- Anonymous `reviewer_profiles` insert blocked

## Manual — public app

- [ ] App loads at `#top` without errors
- [ ] Arabic disclaimer visible: «هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.»
- [ ] Story Mode shows draft banners for non-final content
- [ ] Only ~6 events appear public-final (seed state)
- [ ] 48 `needs_precise_mapping` events **not** shown as verified final

## Manual — auth & roles

- [ ] Mode badge shows **Supabase Staging** (or Production if configured)
- [ ] Reviewer sign-in opens dashboard `#reviewer-dashboard`
- [ ] Viewer sign-in shows **access denied**
- [ ] Anonymous user cannot access reviewer tools
- [ ] Inactive reviewer cannot sign in (inactive message)
- [ ] Wrong password shows readable Arabic error (no stack trace)

## Manual — reviewer tools

- [ ] Review Queue loads with filters/chips
- [ ] Review action insert works for signed-in **reviewer**
- [ ] Confirmation dialog required for approve/reject
- [ ] Review History shows inserted actions
- [ ] Evidence Curation loads queue
- [ ] Content Batches visible per role (submit reviewer, approve admin)

## Manual — admin-only

- [ ] Admin sees **إدارة المراجعين** in Profile
- [ ] Reviewer does **not** see reviewer management section
- [ ] Role change buttons remain disabled (placeholder)
- [ ] Admin can approve/reject batches (with note + confirmation)

## Manual — RLS

- [ ] Anonymous SQL/API: cannot insert `review_actions`
- [ ] Reviewer cannot UPDATE own `reviewer_profiles.role`
- [ ] Public SELECT on `story_events` excludes pending/needs_source/needs_precise_mapping
- [ ] `reviewer_role_audit` not writable from client

## Manual — controlled apply (Phase 10)

- [ ] UI does not mutate `story_*` directly
- [ ] Approved batch → generate SQL via `apply_content_change_batch.mjs`
- [ ] Verify SQL via `verify_applied_batch.mjs` before manual apply

## Regression

- [ ] Local mode still works: `VITE_DATA_MODE=local`, `npm run qa` passes
- [ ] Missing Supabase env falls back to local JSON with banner
- [ ] Review badges unchanged
- [ ] `isFinalContent()` gate unchanged

## Sign-off

| Check | Reviewer | Admin | Date |
|-------|----------|-------|------|
| Smoke script | | | |
| Manual public | | | |
| Manual RLS | | | |
