-- GENERATED ROLLBACK SQL — review before running
-- batch id: example-approved-batch-001
-- generated at: 2026-07-05T06:58:49.714Z
BEGIN;

-- rollback story_events: yusuf_dream
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_text', reviewer_note = NULL, updated_at = now() WHERE id = 'yusuf_dream';
-- rollback story_events: yusuf_dream
UPDATE public.story_events SET updated_at = now() WHERE id = 'yusuf_dream';
COMMIT;
