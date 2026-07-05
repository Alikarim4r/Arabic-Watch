# تقرير الاعتماد النهائي للمالك — 48 ربط دليل

> **لم يتم تطبيق SQL تلقائيًا. يجب مراجعة الملف ثم تطبيقه يدويًا في Supabase أو CI.**

## ملخص

| البند | القيمة |
|-------|--------|
| إجمالي المقترحات المُراجَعة | **48** |
| معتمد من المالك | **48** |
| مستبعد / معلّق | **0** |
| `source_id` | `quran_direct_reference` |
| `evidence_confidence` | `quran_explicit` |
| `evidence_status` (بعد التطبيق) | `precise_evidence` |
| العدد الآمن للعرض النهائي **قبل** التطبيق | **6** (لم يتغير في seed) |

## مصدر الدليل القرآني المباشر

تمت إضافة مصدر معتمد في `src/data/seed_content.json`:

| الحقل | القيمة |
|-------|--------|
| `source_id` | `quran_direct_reference` |
| `name_ar` | القرآن الكريم — موضع الآيات |
| `type` | `quran_reference` |
| المعنى | الدليل هو **نطاق الآيات المذكور** — وليس تفسيرًا ولا ادعاء استيراد النص الكامل |

## ملاحظة المالك (موحّدة لكل الـ 48)

> تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.

## الملفات المُولَّدة

| الملف | الغرض |
|-------|--------|
| `examples/evidence_patch.all_batches.owner_review.approved_by_owner.json` | قرارات المالك المعتمدة (48) |
| `examples/evidence_patch.all_batches.owner_approved.revised.json` | مسودة مُجمَّعة بعد التجميع (48 approved_proposed) |
| `examples/content_change_batch.owner_approved_all_48.json` | دفعة محتوى معتمدة |
| `supabase/generated/apply_owner_approved_all_48.sql` | SQL للتطبيق اليدوي |
| `supabase/generated/rollback_owner_approved_all_48.sql` | SQL للتراجع |
| `scripts/build_owner_approved_all_48_pack.mjs` | مولّد الحزمة |

## نتائج التحقق

```bash
node scripts/validate_owner_review_template.mjs \
  --input examples/evidence_patch.all_batches.owner_review.approved_by_owner.json
# PASS — 48 mappings

node scripts/compile_owner_review_decisions.mjs \
  --input examples/evidence_patch.all_batches.owner_review.approved_by_owner.json \
  --output examples/evidence_patch.all_batches.owner_approved.revised.json
# PASS — 48 approved_proposed

node scripts/validate_revised_evidence_patch.mjs \
  --input examples/evidence_patch.all_batches.owner_approved.revised.json
# PASS

node scripts/validate_content_change_batch.mjs \
  examples/content_change_batch.owner_approved_all_48.json
# PASS — 48 items

node scripts/apply_content_change_batch.mjs \
  --file examples/content_change_batch.owner_approved_all_48.json \
  --dry-run
# PASS

node scripts/verify_applied_batch.mjs \
  --file examples/content_change_batch.owner_approved_all_48.json \
  --sql supabase/generated/apply_owner_approved_all_48.sql
# PASS
```

## تطبيق يدوي آمن (Supabase)

### 1. تأكد من وجود المصدر

قبل التطبيق، تأكد أن `quran_direct_reference` موجود في `tafsir_sources` (عبر `supabase/seed/001_seed_content.sql` المُحدَّث أو إدراج يدوي مماثل).

### 2. راجع SQL

```bash
less supabase/generated/apply_owner_approved_all_48.sql
```

تحقق من:
- `BEGIN;` / `COMMIT;`
- لا `DROP` / `TRUNCATE`
- لا تعديل على `ayahs.text_uthmani`
- فقط `story_events` و `event_ayahs`

### 3. طبّق في Supabase SQL Editor (أو CI)

```sql
-- الصق محتوى apply_owner_approved_all_48.sql بعد المراجعة
```

### 4. للتراجع (إن لزم)

```sql
-- الصق محتوى rollback_owner_approved_all_48.sql
```

## إعادة بناء الحزمة

```bash
node scripts/build_owner_approved_all_48_pack.mjs
# ثم سلسلة التحقق أعلاه
```

## تحذيرات

- **لا يُستورد النص القرآني الكامل** من هذه العملية.
- **لا يُعتبر** `approve_after_source_check` في الملفات اعتمادًا نهائيًا للعرض العام حتى يُطبَّق Controlled Apply.
- بعد التطبيق في قاعدة البيانات، سيرتفع عدد الأحداث ذات `precise_evidence` — راجع `isFinalContent()` قبل أي ترقية للعرض العام.

## إخلاء مسؤولية

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
