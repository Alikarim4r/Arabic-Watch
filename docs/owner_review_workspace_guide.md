# دليل مساحة مراجعة المالك (Owner Review Workspace)

> **هذه المقترحات ليست معتمدة بعد، ولا تصبح نهائية إلا بعد مراجعة المالك ثم إنشاء Content Batch ثم Controlled Apply.**

## فتح مساحة المراجعة

1. افتح التطبيق وانتقل إلى **لوحة المراجع** (`#admin-review`).
2. اختر تبويب **مراجعة المالك** من شريط التنقل.
3. بديلًا: من تبويب **ربط الآيات** → تصفية **كل الدفعات** → زر **فتح مراجعة المالك**.

تُحمَّل البيانات من:

- `src/data/owner_review/all_batches.owner_review_template.json` (داخل التطبيق)
- المصدر المرجعي: `examples/evidence_patch.all_batches.owner_review_template.json`

## مراجعة عنصر واحد (من 48)

1. اختر حدثًا من القائمة اليسرى (48 عنصرًا عند عدم التصفية).
2. راجع الحقول المقترحة: نطاق الآية، `evidence_note_ar`, `reviewer_note`, `risk_level`, `overlap_warning`.
3. املأ نموذج القرار:
   - `owner_decision`: undecided · approve_after_source_check · revise_ayah_range · rename_event · split_event · reject_mapping · needs_source
   - حقول التصحيح عند الحاجة: `corrected_surah_id`, `corrected_ayah_from`, `corrected_ayah_to`, `corrected_event_title`
   - `source_id`, `owner_note`, `final_recommended_status`
4. راقب **معاينة التحقق** لكل عنصر (valid · invalid · missing source_id · cannot approve yet · undecided · rejected proposal).

### قواعد التحقق

| القرار | المتطلبات |
|--------|-----------|
| `approve_after_source_check` | `source_id` + `owner_note` + `final_recommended_status=approved` + ثقة ≠ needs_review + نطاق آية صالح |
| `revise_ayah_range` | نطاق `corrected_*` صالح |
| `rename_event` / `split_event` / `reject_mapping` | `owner_note` مطلوب |
| `undecided` | يبقى pending — لا اعتماد |

**لا يُسمح بـ `final_recommended_status=approved` إلا إذا اجتازت كل الشروط.**

## الحفظ المحلي

- **حفظ تلقائي**: عند تعديل النموذج يُحفظ في `localStorage` (`qsu_owner_review_decisions`).
- **حفظ يدوي**: زر **حفظ محلي (s)** أو اختصار `s`.
- تُعرض حالة الحفظ: آخر وقت حفظ · تحذير تغييرات غير محفوظة.

## التصدير والاستيراد

| زر | النتيجة |
|----|---------|
| تصدير قرارات JSON | ملف بنفس بنية `owner_review_template.json` |
| استيراد قرارات JSON | دمج قرارات المالك من ملف مُصدَّر |
| تصدير CSV | جدول للمراجعة اليدوية |
| نسخ عنصر JSON | عنصر واحد للحافظة |
| نسخ كل القرارات JSON | القالب الكامل للحافظة |

لا يُصدَّر أي عنصر كـ approved إلا إذا اجتاز التحقق.

## إنشاء Revised Proposed Patch

زر **إنشاء Revised Proposed Patch**:

- يولّد بنية `examples/evidence_patch.all_batches.revised.proposed.json`
- يُنزَّل الملف محليًا فقط
- **لا يُطبَّق** على `seed_content.json` أو `precise_event_evidence.json`
- العناصر غير المعتمدة تبقى `pending`
- المرفوضة تُسجَّل كـ `rejected_proposals`

للتجميع من سطر الأوامر (بعد ملء القالب):

```bash
node scripts/compile_owner_review_decisions.mjs \
  --input examples/evidence_patch.all_batches.owner_review_template.json \
  --output examples/evidence_patch.all_batches.revised.proposed.json
```

## لماذا لا يُعتمد أو يُطبَّق شيء؟

هذه المرحلة **مساحة مراجعة فقط**:

- لا تغيّر العدد الآمن للعرض النهائي (يبقى 6)
- لا تُنشئ Content Batch تلقائيًا
- لا تُشغّل Controlled Apply
- لا تستورد نص القرآن الكامل

## بعد اكتمال قرارات المالك

1. صدّر JSON القرارات وضعه في `examples/evidence_patch.all_batches.owner_review_template.json` (أو استخدم مسار التجميع).
2. شغّل `validate_owner_review_template.mjs` و `compile_owner_review_decisions.mjs`.
3. أنشئ **Content Batch** من المخرجات المُجمَّعة.
4. نفّذ **Controlled Apply** بعد موافقة إدارية — خارج نطاق مساحة المراجعة.

## اختصارات لوحة المفاتيح

| مفتاح | إجراء |
|-------|-------|
| `j` | التالي |
| `k` | السابق |
| `/` | تركيز البحث |
| `s` | حفظ محلي |
| `Esc` | إخفاء/إظهار لوحة التفاصيل |

لا توجد اختصارات للاعتماد أو الرفض التلقائي.

## إخلاء مسؤولية

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
