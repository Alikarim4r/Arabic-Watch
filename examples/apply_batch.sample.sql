-- SAMPLE / GENERATED APPLY SQL — review before running in production
-- batch id: example-approved-batch-001
-- generated at: 2026-07-05T12:31:50.579Z
-- dry run status: sql-generation
-- affected records: 2 item(s)
BEGIN;

-- event governance: yusuf_dream
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_text', reviewer_note = 'مثال — دفعة معتمدة توضيحية فقط (example batch)', updated_at = now() WHERE id = 'yusuf_dream';
-- event governance: yusuf_dream
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_text', reviewer_note = 'example batch — idempotent ayah mapping upsert', updated_at = now() WHERE id = 'yusuf_dream';
-- event_ayah mapping: yusuf_dream 12:4-6
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yusuf_dream',
  12,
  4,
  6,
  '12:4-6',
  'main',
  'رؤيا يوسف للشمس والقمر',
  'رؤيا يوسف للشمس والقمر',
  'quran_text',
  'example batch — idempotent ayah mapping upsert',
  now()
)
ON CONFLICT (event_id, surah_id, ayah_from, ayah_to) DO UPDATE SET
  ayah_key = EXCLUDED.ayah_key,
  relation_type = EXCLUDED.relation_type,
  note_ar = EXCLUDED.note_ar,
  evidence_note_ar = EXCLUDED.evidence_note_ar,
  source_id = EXCLUDED.source_id,
  reviewer_note = EXCLUDED.reviewer_note,
  updated_at = now();

-- NOTE: UI does not apply batches — run manually after verify_applied_batch.mjs
COMMIT;
