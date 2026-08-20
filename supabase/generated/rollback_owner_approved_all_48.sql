-- GENERATED ROLLBACK SQL — review before running
-- batch id: owner-approved-all-48-001
-- generated at: 2026-07-05T10:37:13.172Z
BEGIN;

-- rollback story_events: adam_01__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'adam_01__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'adam_01__' AND surah_id = 2 AND ayah_from = 31 AND ayah_to = 33;
-- rollback story_events: adam_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'adam_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'adam_02__' AND surah_id = 2 AND ayah_from = 34 AND ayah_to = 34;
-- rollback story_events: adam_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'adam_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'adam_03__' AND surah_id = 2 AND ayah_from = 35 AND ayah_to = 36;
-- rollback story_events: adam_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'adam_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'adam_04__' AND surah_id = 2 AND ayah_from = 35 AND ayah_to = 39;
-- rollback story_events: ayyub_01__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'ayyub_01__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'ayyub_01__' AND surah_id = 21 AND ayah_from = 83 AND ayah_to = 83;
-- rollback story_events: ayyub_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'ayyub_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'ayyub_02__' AND surah_id = 21 AND ayah_from = 83 AND ayah_to = 84;
-- rollback story_events: ayyub_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'ayyub_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'ayyub_03__' AND surah_id = 21 AND ayah_from = 84 AND ayah_to = 84;
-- rollback story_events: dawud_01__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'dawud_01__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'dawud_01__' AND surah_id = 2 AND ayah_from = 251 AND ayah_to = 251;
-- rollback story_events: dawud_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'dawud_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'dawud_02__' AND surah_id = 38 AND ayah_from = 21 AND ayah_to = 26;
-- rollback story_events: dawud_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'dawud_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'dawud_03__' AND surah_id = 38 AND ayah_from = 18 AND ayah_to = 19;
-- rollback story_events: dhulqarnayn_01__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'dhulqarnayn_01__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'dhulqarnayn_01__' AND surah_id = 18 AND ayah_from = 83 AND ayah_to = 86;
-- rollback story_events: dhulqarnayn_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'dhulqarnayn_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'dhulqarnayn_02__' AND surah_id = 18 AND ayah_from = 87 AND ayah_to = 88;
-- rollback story_events: dhulqarnayn_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'dhulqarnayn_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'dhulqarnayn_03__' AND surah_id = 18 AND ayah_from = 94 AND ayah_to = 98;
-- rollback story_events: ibrahim_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'ibrahim_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'ibrahim_03__' AND surah_id = 21 AND ayah_from = 68 AND ayah_to = 70;
-- rollback story_events: ibrahim_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'ibrahim_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'ibrahim_04__' AND surah_id = 37 AND ayah_from = 102 AND ayah_to = 107;
-- rollback story_events: ibrahim_05__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'ibrahim_05__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'ibrahim_05__' AND surah_id = 2 AND ayah_from = 127 AND ayah_to = 129;
-- rollback story_events: isa_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'isa_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'isa_02__' AND surah_id = 5 AND ayah_from = 110 AND ayah_to = 115;
-- rollback story_events: isa_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'isa_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'isa_03__' AND surah_id = 3 AND ayah_from = 52 AND ayah_to = 53;
-- rollback story_events: isa_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'isa_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'isa_04__' AND surah_id = 5 AND ayah_from = 116 AND ayah_to = 118;
-- rollback story_events: maryam_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'maryam_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'maryam_02__' AND surah_id = 3 AND ayah_from = 45 AND ayah_to = 47;
-- rollback story_events: maryam_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'maryam_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'maryam_03__' AND surah_id = 19 AND ayah_from = 22 AND ayah_to = 26;
-- rollback story_events: maryam_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'maryam_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'maryam_04__' AND surah_id = 19 AND ayah_from = 27 AND ayah_to = 33;
-- rollback story_events: muhammad_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'muhammad_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'muhammad_02__' AND surah_id = 9 AND ayah_from = 40 AND ayah_to = 40;
-- rollback story_events: muhammad_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'muhammad_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'muhammad_03__' AND surah_id = 3 AND ayah_from = 123 AND ayah_to = 126;
-- rollback story_events: muhammad_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'muhammad_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'muhammad_04__' AND surah_id = 33 AND ayah_from = 9 AND ayah_to = 22;
-- rollback story_events: muhammad_05__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'muhammad_05__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'muhammad_05__' AND surah_id = 48 AND ayah_from = 1 AND ayah_to = 3;
-- rollback story_events: musa_firawn
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_firawn';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_firawn' AND surah_id = 20 AND ayah_from = 24 AND ayah_to = 56;
-- rollback story_events: musa_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_03__' AND surah_id = 28 AND ayah_from = 22 AND ayah_to = 28;
-- rollback story_events: musa_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_04__' AND surah_id = 20 AND ayah_from = 9 AND ayah_to = 16;
-- rollback story_events: musa_05__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_05__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_05__' AND surah_id = 7 AND ayah_from = 103 AND ayah_to = 108;
-- rollback story_events: musa_06__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_06__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_06__' AND surah_id = 7 AND ayah_from = 113 AND ayah_to = 122;
-- rollback story_events: musa_07__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_07__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_07__' AND surah_id = 26 AND ayah_from = 63 AND ayah_to = 66;
-- rollback story_events: musa_08__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_08__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_08__' AND surah_id = 20 AND ayah_from = 83 AND ayah_to = 89;
-- rollback story_events: musa_09__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'musa_09__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'musa_09__' AND surah_id = 18 AND ayah_from = 60 AND ayah_to = 82;
-- rollback story_events: nuh_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'nuh_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'nuh_03__' AND surah_id = 11 AND ayah_from = 40 AND ayah_to = 41;
-- rollback story_events: nuh_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'nuh_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'nuh_04__' AND surah_id = 11 AND ayah_from = 42 AND ayah_to = 46;
-- rollback story_events: sulayman_01__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'sulayman_01__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'sulayman_01__' AND surah_id = 27 AND ayah_from = 20 AND ayah_to = 22;
-- rollback story_events: sulayman_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'sulayman_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'sulayman_02__' AND surah_id = 27 AND ayah_from = 23 AND ayah_to = 31;
-- rollback story_events: sulayman_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'sulayman_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'sulayman_03__' AND surah_id = 27 AND ayah_from = 38 AND ayah_to = 40;
-- rollback story_events: yunus_01__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yunus_01__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yunus_01__' AND surah_id = 37 AND ayah_from = 139 AND ayah_to = 141;
-- rollback story_events: yunus_02__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yunus_02__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yunus_02__' AND surah_id = 37 AND ayah_from = 139 AND ayah_to = 144;
-- rollback story_events: yunus_03__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yunus_03__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yunus_03__' AND surah_id = 21 AND ayah_from = 87 AND ayah_to = 88;
-- rollback story_events: yunus_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yunus_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yunus_04__' AND surah_id = 10 AND ayah_from = 98 AND ayah_to = 98;
-- rollback story_events: yusuf_04__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yusuf_04__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yusuf_04__' AND surah_id = 12 AND ayah_from = 23 AND ayah_to = 29;
-- rollback story_events: yusuf_05__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yusuf_05__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yusuf_05__' AND surah_id = 12 AND ayah_from = 33 AND ayah_to = 42;
-- rollback story_events: yusuf_06__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yusuf_06__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yusuf_06__' AND surah_id = 12 AND ayah_from = 43 AND ayah_to = 49;
-- rollback story_events: yusuf_07__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yusuf_07__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yusuf_07__' AND surah_id = 12 AND ayah_from = 54 AND ayah_to = 57;
-- rollback story_events: yusuf_08__
UPDATE public.story_events SET review_status = 'pending', source_status = 'pending', evidence_status = 'needs_precise_mapping', evidence_confidence = 'needs_review', source_id = NULL, reviewer_note = NULL, updated_at = now() WHERE id = 'yusuf_08__';
-- rollback delete event_ayah inserted by batch
DELETE FROM public.event_ayahs WHERE event_id = 'yusuf_08__' AND surah_id = 12 AND ayah_from = 92 AND ayah_to = 100;
COMMIT;
