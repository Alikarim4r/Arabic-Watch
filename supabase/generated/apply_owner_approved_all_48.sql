-- SAMPLE / GENERATED APPLY SQL — review before running in production
-- batch id: owner-approved-all-48-001
-- generated at: 2026-07-05T10:37:13.168Z
-- dry run status: sql-generation
-- affected records: 48 item(s)
BEGIN;

-- event governance: adam_01__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'adam_01__';
-- event_ayah mapping: adam_01__ 2:31-33
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'adam_01__',
  2,
  31,
  33,
  '2:31-33',
  'main',
  'آيات تعليم آدم الأسماء كلها — مقترح ضمن سياق قصة آدم في سورة البقرة (مسودة prototype: 2:30-37).',
  'آيات تعليم آدم الأسماء كلها — مقترح ضمن سياق قصة آدم في سورة البقرة (مسودة prototype: 2:30-37).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: adam_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'adam_02__';
-- event_ayah mapping: adam_02__ 2:34
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'adam_02__',
  2,
  34,
  34,
  '2:34',
  'main',
  'أمر السجود لآدم — آية 2:34 في سورة البقرة (ضمن سرد قصة آدم في المسودة 2:30-37).',
  'أمر السجود لآدم — آية 2:34 في سورة البقرة (ضمن سرد قصة آدم في المسودة 2:30-37).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: adam_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'adam_03__';
-- event_ayah mapping: adam_03__ 2:35-36
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'adam_03__',
  2,
  35,
  36,
  '2:35-36',
  'main',
  'نهي عن الشجرة ووسوسة إبليس وإغواؤهما — آيات 2:35-36 في سورة البقرة.',
  'نهي عن الشجرة ووسوسة إبليس وإغواؤهما — آيات 2:35-36 في سورة البقرة.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: adam_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'adam_04__';
-- event_ayah mapping: adam_04__ 2:35-39
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'adam_04__',
  2,
  35,
  39,
  '2:35-39',
  'main',
  'آيات الهبوط من الجنة وتوبة آدم وحواء وقبول التوبة — مقترح ضمن 2:30-37.',
  'آيات الهبوط من الجنة وتوبة آدم وحواء وقبول التوبة — مقترح ضمن 2:30-37.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: ayyub_01__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'ayyub_01__';
-- event_ayah mapping: ayyub_01__ 21:83
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'ayyub_01__',
  21,
  83,
  83,
  '21:83',
  'main',
  'ذكر ضر أيوب — آية 21:83 في سورة الأنبياء (ضمن كتلة prototype 21:83-84).',
  'ذكر ضر أيوب — آية 21:83 في سورة الأنبياء (ضمن كتلة prototype 21:83-84).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: ayyub_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'ayyub_02__';
-- event_ayah mapping: ayyub_02__ 21:83-84
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'ayyub_02__',
  21,
  83,
  84,
  '21:83-84',
  'main',
  'دعاء أيوب وفرج الله — مسودة prototype: الأنبياء 21:83-84.',
  'دعاء أيوب وفرج الله — مسودة prototype: الأنبياء 21:83-84.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: ayyub_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'ayyub_03__';
-- event_ayah mapping: ayyub_03__ 21:84
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'ayyub_03__',
  21,
  84,
  84,
  '21:84',
  'main',
  'فرج الله لأيوب وكشف الضر وإعادة الأهل — آية 21:84 في سورة الأنبياء.',
  'فرج الله لأيوب وكشف الضر وإعادة الأهل — آية 21:84 في سورة الأنبياء.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: dawud_01__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'dawud_01__';
-- event_ayah mapping: dawud_01__ 2:251
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'dawud_01__',
  2,
  251,
  251,
  '2:251',
  'main',
  'قتل داود لجالوت — آية مشهورة في سورة البقرة 2:251.',
  'قتل داود لجالوت — آية مشهورة في سورة البقرة 2:251.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: dawud_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'dawud_02__';
-- event_ayah mapping: dawud_02__ 38:21-26
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'dawud_02__',
  38,
  21,
  26,
  '38:21-26',
  'main',
  'قصة الحكم بين الراعيين — مسودة prototype: ص 38:17-26 (مقترح 38:21-26 للحكم).',
  'قصة الحكم بين الراعيين — مسودة prototype: ص 38:17-26 (مقترح 38:21-26 للحكم).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: dawud_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'dawud_03__';
-- event_ayah mapping: dawud_03__ 38:18-19
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'dawud_03__',
  38,
  18,
  19,
  '38:18-19',
  'main',
  'تسبيح الجبال مع داود — آيات ص 38:18-19.',
  'تسبيح الجبال مع داود — آيات ص 38:18-19.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: dhulqarnayn_01__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'dhulqarnayn_01__';
-- event_ayah mapping: dhulqarnayn_01__ 18:83-86
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'dhulqarnayn_01__',
  18,
  83,
  86,
  '18:83-86',
  'main',
  'بداية سفر ذي القرنين غربًا حتى غروب الشمس — الكهف 18:83-86.',
  'بداية سفر ذي القرنين غربًا حتى غروب الشمس — الكهف 18:83-86.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: dhulqarnayn_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'dhulqarnayn_02__';
-- event_ayah mapping: dhulqarnayn_02__ 18:87-88
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'dhulqarnayn_02__',
  18,
  87,
  88,
  '18:87-88',
  'main',
  'جزاء الظالم والمؤمن في مسيرة ذي القرنين — الكهف 18:87-88.',
  'جزاء الظالم والمؤمن في مسيرة ذي القرنين — الكهف 18:87-88.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: dhulqarnayn_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'dhulqarnayn_03__';
-- event_ayah mapping: dhulqarnayn_03__ 18:94-98
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'dhulqarnayn_03__',
  18,
  94,
  98,
  '18:94-98',
  'main',
  'بناء السد بين الجبلين — ختام سرد ذي القرنين في الكهف (prototype 18:83-98).',
  'بناء السد بين الجبلين — ختام سرد ذي القرنين في الكهف (prototype 18:83-98).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: ibrahim_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'ibrahim_03__';
-- event_ayah mapping: ibrahim_03__ 21:68-70
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'ibrahim_03__',
  21,
  68,
  70,
  '21:68-70',
  'main',
  'إلقاء إبراهيم في النار وجعلها بردًا وسلامًا — آيات 21:68-70 في سورة الأنبياء.',
  'إلقاء إبراهيم في النار وجعلها بردًا وسلامًا — آيات 21:68-70 في سورة الأنبياء.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: ibrahim_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'ibrahim_04__';
-- event_ayah mapping: ibrahim_04__ 37:102-107
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'ibrahim_04__',
  37,
  102,
  107,
  '37:102-107',
  'main',
  'آيات ابتلاء إبراهيم بذبح ابنه وفديه بالذبح العظيم — القصة منصوص عليها في سورة الصافات.',
  'آيات ابتلاء إبراهيم بذبح ابنه وفديه بالذبح العظيم — القصة منصوص عليها في سورة الصافات.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: ibrahim_05__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'ibrahim_05__';
-- event_ayah mapping: ibrahim_05__ 2:127-129
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'ibrahim_05__',
  2,
  127,
  129,
  '2:127-129',
  'main',
  'آيات رفع إبراهيم وإسماعيل قواعد البيت والدعاء — حدث «بناء البيت».',
  'آيات رفع إبراهيم وإسماعيل قواعد البيت والدعاء — حدث «بناء البيت».',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: isa_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'isa_02__';
-- event_ayah mapping: isa_02__ 5:110-115
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'isa_02__',
  5,
  110,
  115,
  '5:110-115',
  'main',
  'ذكر معجزات عيسى في سياق الحوار يوم القيامة — المائدة 5:110-115.',
  'ذكر معجزات عيسى في سياق الحوار يوم القيامة — المائدة 5:110-115.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: isa_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'isa_03__';
-- event_ayah mapping: isa_03__ 3:52-53
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'isa_03__',
  3,
  52,
  53,
  '3:52-53',
  'main',
  'إعلان الحواريين أنصار الله — آل عمران 3:52-53.',
  'إعلان الحواريين أنصار الله — آل عمران 3:52-53.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: isa_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'isa_04__';
-- event_ayah mapping: isa_04__ 5:116-118
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'isa_04__',
  5,
  116,
  118,
  '5:116-118',
  'main',
  'آيات تصحيح الغلو في عيسى — سؤال الله لعيسى عن قول الناس وبراءته — مسودة prototype: المائدة 5:116-118.',
  'آيات تصحيح الغلو في عيسى — سؤال الله لعيسى عن قول الناس وبراءته — مسودة prototype: المائدة 5:116-118.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: maryam_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'maryam_02__';
-- event_ayah mapping: maryam_02__ 3:45-47
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'maryam_02__',
  3,
  45,
  47,
  '3:45-47',
  'main',
  'بشارة الملائكة لمريم بولد اسمه المسيح عيسى — آل عمران 3:45-47.',
  'بشارة الملائكة لمريم بولد اسمه المسيح عيسى — آل عمران 3:45-47.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: maryam_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'maryam_03__';
-- event_ayah mapping: maryam_03__ 19:22-26
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'maryam_03__',
  19,
  22,
  26,
  '19:22-26',
  'main',
  'آيات مخاض مريم وندائها لو أنها ماتت قبل هذا — ضمن سرد سورة مريم (مسودة prototype: 19:16-34).',
  'آيات مخاض مريم وندائها لو أنها ماتت قبل هذا — ضمن سرد سورة مريم (مسودة prototype: 19:16-34).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: maryam_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'maryam_04__';
-- event_ayah mapping: maryam_04__ 19:27-33
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'maryam_04__',
  19,
  27,
  33,
  '19:27-33',
  'main',
  'آيات عودة مريم إلى قومها بالمولود والتعجب من المعجزة — تتمة سورة مريم.',
  'آيات عودة مريم إلى قومها بالمولود والتعجب من المعجزة — تتمة سورة مريم.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: muhammad_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'muhammad_02__';
-- event_ayah mapping: muhammad_02__ 9:40
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'muhammad_02__',
  9,
  40,
  40,
  '9:40',
  'main',
  'آية الرفيقين في الغار أثناء الهجرة — التوبة 9:40.',
  'آية الرفيقين في الغار أثناء الهجرة — التوبة 9:40.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: muhammad_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'muhammad_03__';
-- event_ayah mapping: muhammad_03__ 3:123-126
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'muhammad_03__',
  3,
  123,
  126,
  '3:123-126',
  'main',
  'ذكر نصر الله ببدر — آيات آل عمران 3:123-126.',
  'ذكر نصر الله ببدر — آيات آل عمران 3:123-126.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: muhammad_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'muhammad_04__';
-- event_ayah mapping: muhammad_04__ 33:9-22
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'muhammad_04__',
  33,
  9,
  22,
  '33:9-22',
  'main',
  'غزوة الأحزاب والخندق — سورة الأحزاب 33:9-22.',
  'غزوة الأحزاب والخندق — سورة الأحزاب 33:9-22.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: muhammad_05__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'muhammad_05__';
-- event_ayah mapping: muhammad_05__ 48:1-3
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'muhammad_05__',
  48,
  1,
  3,
  '48:1-3',
  'main',
  'بداية سورة الفتح ونصر الله وبشارة الفتح — 48:1-3.',
  'بداية سورة الفتح ونصر الله وبشارة الفتح — 48:1-3.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_firawn
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_firawn';
-- event_ayah mapping: musa_firawn 20:24-56
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_firawn',
  20,
  24,
  56,
  '20:24-56',
  'main',
  'مرجع seed صريح: «سورة طه 24-56» — سرد موسى مع فرعون والآيات والحجة.',
  'مرجع seed صريح: «سورة طه 24-56» — سرد موسى مع فرعون والآيات والحجة.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_03__';
-- event_ayah mapping: musa_03__ 28:22-28
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_03__',
  28,
  22,
  28,
  '28:22-28',
  'main',
  'آيات موسى في مدين: الهرب، الماء، الشعيب، الزواج — سورة القصص (ضمن prototype 28:7-35).',
  'آيات موسى في مدين: الهرب، الماء، الشعيب، الزواج — سورة القصص (ضمن prototype 28:7-35).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_04__';
-- event_ayah mapping: musa_04__ 20:9-16
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_04__',
  20,
  9,
  16,
  '20:9-16',
  'main',
  'الوحي عند الشجرة المباركة ونداء موسى — بداية سرد طه (20:9-16).',
  'الوحي عند الشجرة المباركة ونداء موسى — بداية سرد طه (20:9-16).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_05__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_05__';
-- event_ayah mapping: musa_05__ 7:103-108
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_05__',
  7,
  103,
  108,
  '7:103-108',
  'main',
  'إرسال موسى وهارون إلى فرعون بالآيات — سورة الأعراف 7:103-108.',
  'إرسال موسى وهارون إلى فرعون بالآيات — سورة الأعراف 7:103-108.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_06__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_06__';
-- event_ayah mapping: musa_06__ 7:113-122
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_06__',
  7,
  113,
  122,
  '7:113-122',
  'main',
  'مجادلة السحرة وإلقاء العصي ثم سجودهم — سورة الأعراف 7:113-122.',
  'مجادلة السحرة وإلقاء العصي ثم سجودهم — سورة الأعراف 7:113-122.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_07__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_07__';
-- event_ayah mapping: musa_07__ 26:63-66
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_07__',
  26,
  63,
  66,
  '26:63-66',
  'main',
  'ضرب البحر وفلقه ونجاة بني إسرائيل — سورة الشعراء 26:63-66.',
  'ضرب البحر وفلقه ونجاة بني إسرائيل — سورة الشعراء 26:63-66.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_08__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_08__';
-- event_ayah mapping: musa_08__ 20:83-89
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_08__',
  20,
  83,
  89,
  '20:83-89',
  'main',
  'قصة العجل وعبادة بني إسرائيل وندم موسى — سورة طه 20:83-89.',
  'قصة العجل وعبادة بني إسرائيل وندم موسى — سورة طه 20:83-89.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: musa_09__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'musa_09__';
-- event_ayah mapping: musa_09__ 18:60-82
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'musa_09__',
  18,
  60,
  82,
  '18:60-82',
  'main',
  'قصة موسى والخضر — مسودة prototype: الكهف 18:60-82.',
  'قصة موسى والخضر — مسودة prototype: الكهف 18:60-82.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: nuh_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'nuh_03__';
-- event_ayah mapping: nuh_03__ 11:40-41
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'nuh_03__',
  11,
  40,
  41,
  '11:40-41',
  'main',
  'صعود السفينة وبداية الطوفان — سورة هود 11:40-41.',
  'صعود السفينة وبداية الطوفان — سورة هود 11:40-41.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: nuh_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'nuh_04__';
-- event_ayah mapping: nuh_04__ 11:42-46
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'nuh_04__',
  11,
  42,
  46,
  '11:42-46',
  'main',
  'نداء نوح لابنه وغرق الكافرين — سورة هود (بعد صعود السفينة في 11:40-41).',
  'نداء نوح لابنه وغرق الكافرين — سورة هود (بعد صعود السفينة في 11:40-41).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: sulayman_01__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'sulayman_01__';
-- event_ayah mapping: sulayman_01__ 27:20-22
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'sulayman_01__',
  27,
  20,
  22,
  '27:20-22',
  'main',
  'الهدهد وغيابه واكتشاف ملكة سبأ — بداية سرد النمل (ضمن prototype 27:15-44).',
  'الهدهد وغيابه واكتشاف ملكة سبأ — بداية سرد النمل (ضمن prototype 27:15-44).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: sulayman_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'sulayman_02__';
-- event_ayah mapping: sulayman_02__ 27:23-31
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'sulayman_02__',
  27,
  23,
  31,
  '27:23-31',
  'main',
  'رسالة سليمان إلى ملكة سبأ واستجابتها — ضمن سورة النمل (prototype 27:15-44).',
  'رسالة سليمان إلى ملكة سبأ واستجابتها — ضمن سورة النمل (prototype 27:15-44).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: sulayman_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'sulayman_03__';
-- event_ayah mapping: sulayman_03__ 27:38-40
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'sulayman_03__',
  27,
  38,
  40,
  '27:38-40',
  'main',
  'إحضار عرش ملكة سبأ وتمييز سليمان — سورة النمل 27:38-40.',
  'إحضار عرش ملكة سبأ وتمييز سليمان — سورة النمل 27:38-40.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yunus_01__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yunus_01__';
-- event_ayah mapping: yunus_01__ 37:139-141
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yunus_01__',
  37,
  139,
  141,
  '37:139-141',
  'main',
  'مغاضبة يونس ومغادرته إلى الفلك المشحون — بداية سرد الصافات 37:139-141.',
  'مغاضبة يونس ومغادرته إلى الفلك المشحون — بداية سرد الصافات 37:139-141.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yunus_02__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yunus_02__';
-- event_ayah mapping: yunus_02__ 37:139-144
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yunus_02__',
  37,
  139,
  144,
  '37:139-144',
  'main',
  'سرد يونس والحوت في سورة الصافات — مقترح لحدث «الحوت» (مسودة prototype تركز على 21:87-88 للدعاء).',
  'سرد يونس والحوت في سورة الصافات — مقترح لحدث «الحوت» (مسودة prototype تركز على 21:87-88 للدعاء).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yunus_03__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yunus_03__';
-- event_ayah mapping: yunus_03__ 21:87-88
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yunus_03__',
  21,
  87,
  88,
  '21:87-88',
  'main',
  'دعاء يونس في الظلمات — مسودة prototype: الأنبياء 21:87-88.',
  'دعاء يونس في الظلمات — مسودة prototype: الأنبياء 21:87-88.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yunus_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yunus_04__';
-- event_ayah mapping: yunus_04__ 10:98
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yunus_04__',
  10,
  98,
  98,
  '10:98',
  'main',
  'نجاة أهل يونس حين آمنوا — آية يونس 10:98.',
  'نجاة أهل يونس حين آمنوا — آية يونس 10:98.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yusuf_04__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yusuf_04__';
-- event_ayah mapping: yusuf_04__ 12:23-29
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yusuf_04__',
  12,
  23,
  29,
  '12:23-29',
  'main',
  'فتنة امرأة العزيز ومحاولة الإغراء — بداية سرد الفتنة في سورة يوسف (ضمن كتلة prototype 12:23-57).',
  'فتنة امرأة العزيز ومحاولة الإغراء — بداية سرد الفتنة في سورة يوسف (ضمن كتلة prototype 12:23-57).',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yusuf_05__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yusuf_05__';
-- event_ayah mapping: yusuf_05__ 12:33-42
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yusuf_05__',
  12,
  33,
  42,
  '12:33-42',
  'main',
  'اختيار السجن ودخوله مع الرفيقين — سورة يوسف 12:33-42.',
  'اختيار السجن ودخوله مع الرفيقين — سورة يوسف 12:33-42.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yusuf_06__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yusuf_06__';
-- event_ayah mapping: yusuf_06__ 12:43-49
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yusuf_06__',
  12,
  43,
  49,
  '12:43-49',
  'main',
  'تأويل رؤيا الرفيقين في السجن — سورة يوسف 12:43-49.',
  'تأويل رؤيا الرفيقين في السجن — سورة يوسف 12:43-49.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yusuf_07__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yusuf_07__';
-- event_ayah mapping: yusuf_07__ 12:54-57
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yusuf_07__',
  12,
  54,
  57,
  '12:54-57',
  'main',
  'تمكين يوسف في الأرض وتوليه خزائنها — سورة يوسف 12:54-57.',
  'تمكين يوسف في الأرض وتوليه خزائنها — سورة يوسف 12:54-57.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
-- event governance: yusuf_08__
UPDATE public.story_events SET review_status = 'approved', source_status = 'cited', evidence_status = 'precise_evidence', evidence_confidence = 'quran_explicit', source_id = 'quran_direct_reference', reviewer_note = 'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.', updated_at = now() WHERE id = 'yusuf_08__';
-- event_ayah mapping: yusuf_08__ 12:92-100
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  'yusuf_08__',
  12,
  92,
  100,
  '12:92-100',
  'main',
  'عفو يوسف عن إخوته ومصالحتهم — ختام سورة يوسف 12:92-100.',
  'عفو يوسف عن إخوته ومصالحتهم — ختام سورة يوسف 12:92-100.',
  'quran_direct_reference',
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.',
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
