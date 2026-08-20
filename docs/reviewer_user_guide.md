# Reviewer User Guide

Guide for scholars and reviewers using Quran Story Universe in **local demo** or **Supabase production** mode.

## Signing in

### Local demo (`VITE_DATA_MODE=local`)

- Open `#admin-review`
- Banner: **«وضع تجريبي محلي — لا توجد صلاحيات إنتاجية»**
- In **Profile → إعدادات الحساب**, choose mock role: `reviewer` or `admin`
- No production credentials required

### Supabase production

- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Sign in with email/password in Profile tab
- Only users with `reviewer_profiles.role` = `reviewer` or `admin` can access reviewer tools
- Viewers see **access denied**

## Reviewer Dashboard

Navigate to **لوحة التحكم** (`#reviewer-dashboard`):

- Queue totals: pending, needs_source, needs_precise_mapping, needs_review
- Safe public-final vs blocked counts
- Quick actions to Review Queue, Evidence Curation, Batches, History, Profile
- Latest review actions, patches, and batches (session or Supabase)

## Review Queue workflow

1. Open **قائمة المراجعة**
2. Use search (record id, title, node) and filter chips
3. Save filters to localStorage with **حفظ التصفية**
4. Select a record — use **التالي/السابق** or `j` / `k`
5. Add notes: `reviewer_note`, optional internal/source/evidence notes
6. Choose action — **confirmation required** for approve/reject/needs_source/request_revision
7. Required notes for: approve, reject, request_revision

**Important:** Actions are audit-only. They do **not** auto-update public content tables.

## Evidence mapping (Evidence Curation)

1. Open **ربط الآيات**
2. Select event from needs_precise_mapping queue
3. Enter precise surah/ayah range, source, evidence notes
4. Draft autosaves to session + localStorage
5. Use **معاينة التحقق** before export
6. Export JSON patch or submit to Supabase (proposed only)

Warning: **«لا تستخدم الربط التقريبي…»** — no approximate mapping.

## Content batches

Reviewers create/submit batches; admins approve. Apply is **SQL-only** via `apply_content_change_batch.mjs` — UI never mutates `story_*` tables.

## What reviewers must NOT do

- Do not auto-approve content from the UI expecting public visibility
- Do not invent tafsir or ayah references
- Do not mark needs_precise_mapping events as public-final without precise evidence
- Do not mutate Quran `text_uthmani`
- Do not skip confirmation or required notes on sensitive actions

## Disclaimer

Public and reviewer surfaces show:

> هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
