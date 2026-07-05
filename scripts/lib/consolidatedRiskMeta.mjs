/** Risk level and overlap warnings per event_id for consolidated owner review. */

/** @type {Record<string, { risk_level: 'high'|'medium'|'low', overlap_warning: string }>} */
export const CONSOLIDATED_RISK_META = {
  adam_01__: {
    risk_level: 'high',
    overlap_warning: 'تقسيم كتلة البقرة 2:30-37 مع adam_02__ وadam_03__ وadam_04__',
  },
  adam_02__: {
    risk_level: 'high',
    overlap_warning: 'نطاق 2:34 ضمن كتلة آدم في البقرة — تداخل مع الدفعة 1 و3',
  },
  adam_03__: {
    risk_level: 'high',
    overlap_warning: '2:35-36 يتداخل مع adam_04__ (2:35-39) في الدفعة 1',
  },
  adam_04__: {
    risk_level: 'high',
    overlap_warning: '2:35-39 يتداخل مع adam_03__ في الدفعة 3',
  },
  ibrahim_03__: {
    risk_level: 'medium',
    overlap_warning: 'نطاق فرعي ضمن ibrahim_kaaba precise (21:51-70)',
  },
  ibrahim_04__: { risk_level: 'low', overlap_warning: '' },
  ibrahim_05__: {
    risk_level: 'high',
    overlap_warning: 'تداخل محتمل مع ibrahim_kaaba precise (21:51-70) و2:127-129',
  },
  maryam_02__: {
    risk_level: 'high',
    overlap_warning: '3:45-47 مقابل isa_birth (19:16-21) وmaryam_03__ (19:22-26)',
  },
  maryam_03__: {
    risk_level: 'high',
    overlap_warning: '19:22-26 بعد isa_birth precise (19:16-21)',
  },
  maryam_04__: {
    risk_level: 'medium',
    overlap_warning: 'تتمة سورة مريم — حدود ayah_to مع 34',
  },
  musa_firawn: {
    risk_level: 'high',
    overlap_warning: 'العنوان «اليم» يتعارض مع ملخص فرعون؛ نطاق طه 20:24-56 واسع',
  },
  musa_03__: { risk_level: 'medium', overlap_warning: 'نطاق القصص 28:22-28 — مسودة sprint' },
  musa_04__: {
    risk_level: 'high',
    overlap_warning: 'طه 20:9-16 يتداخل موضوعيًا مع musa_firawn (20:24-56)',
  },
  musa_05__: { risk_level: 'medium', overlap_warning: 'سرد الأعراف مقابل طه لقصة فرعون' },
  musa_06__: { risk_level: 'medium', overlap_warning: 'سحرة الأعراف — حدود مع musa_05__' },
  musa_07__: {
    risk_level: 'medium',
    overlap_warning: 'فلق البحر مذكور في عدة سور — الشعراء 26:63-66 مقترح',
  },
  musa_08__: { risk_level: 'medium', overlap_warning: 'العجل في طه — روايات في البقرة والأعراف' },
  musa_09__: { risk_level: 'medium', overlap_warning: 'نطاق طويل الكهف 18:60-82' },
  isa_02__: {
    risk_level: 'high',
    overlap_warning: 'معجزات 5:110-115 قريبة من isa_04__ (5:116-118) في الدفعة 1',
  },
  isa_03__: { risk_level: 'medium', overlap_warning: '3:52-53 — بديل محتمل الصف 61:14' },
  isa_04__: { risk_level: 'medium', overlap_warning: 'كتلة الغلو 5:116-118' },
  yunus_01__: {
    risk_level: 'high',
    overlap_warning: '37:139-141 فرعي من yunus_02__ (37:139-144) في الدفعة 2',
  },
  yunus_02__: {
    risk_level: 'high',
    overlap_warning: 'سرد الصافات — تداخل مع yunus_01__ وyunus_04__',
  },
  yunus_03__: { risk_level: 'medium', overlap_warning: '21:87-88 — آية مشهورة تحتاج مراجعة' },
  yunus_04__: {
    risk_level: 'medium',
    overlap_warning: '10:98 نجاة القوم — مختلف عن سرد الحوت',
  },
  ayyub_01__: { risk_level: 'medium', overlap_warning: '21:83 — تداخل مع ayyub_02__ و03__' },
  ayyub_02__: {
    risk_level: 'high',
    overlap_warning: '21:83-84 يتداخل مع ayyub_01__ وayyub_03__ (21:84)',
  },
  ayyub_03__: {
    risk_level: 'high',
    overlap_warning: '21:84 ضمن نطاق ayyub_02__ في الدفعة 2',
  },
  sulayman_01__: { risk_level: 'medium', overlap_warning: 'فرعي من كتلة النمل 27:15-44' },
  sulayman_02__: {
    risk_level: 'high',
    overlap_warning: '27:23-31 — حدود مع sulayman_03__ (27:38-40)',
  },
  sulayman_03__: {
    risk_level: 'high',
    overlap_warning: 'يتبع sulayman_02__ في سورة النمل',
  },
  dawud_01__: { risk_level: 'low', overlap_warning: '' },
  dawud_02__: { risk_level: 'medium', overlap_warning: 'تقسيم ص 38:17-26' },
  dawud_03__: { risk_level: 'medium', overlap_warning: 'تسبيح الجبال — بدائل 21:79 و34:10' },
  dhulqarnayn_01__: {
    risk_level: 'high',
    overlap_warning: 'بداية كتلة الكهف 18:83-98 — قبل dhulqarnayn_03__',
  },
  dhulqarnayn_02__: {
    risk_level: 'high',
    overlap_warning: '18:87-88 بين السفر وبناء السد',
  },
  dhulqarnayn_03__: {
    risk_level: 'high',
    overlap_warning: '18:94-98 — ختام كتلة ذي القرنين',
  },
  nuh_03__: {
    risk_level: 'high',
    overlap_warning: '11:40-41 يتداخل مع nuh_ark (11:36-44) وnuh_04__',
  },
  nuh_04__: {
    risk_level: 'high',
    overlap_warning: '11:42-46 يتداخل مع nuh_ark وnuh_03__',
  },
  yusuf_04__: {
    risk_level: 'high',
    overlap_warning: 'فرعي من yusuf_prison precise (12:23-57)',
  },
  yusuf_05__: {
    risk_level: 'high',
    overlap_warning: '12:33-42 ضمن yusuf_prison — تداخل مع yusuf_04__',
  },
  yusuf_06__: {
    risk_level: 'high',
    overlap_warning: '12:43-49 ضمن yusuf_prison',
  },
  yusuf_07__: {
    risk_level: 'high',
    overlap_warning: '12:54-57 قد يحتاج 12:50-53 — yusuf_prison',
  },
  yusuf_08__: { risk_level: 'medium', overlap_warning: '12:92-100 ختام السورة' },
  muhammad_02__: { risk_level: 'medium', overlap_warning: '9:40 آية واحدة — قد يحتاج نطاقًا أوسع' },
  muhammad_03__: {
    risk_level: 'high',
    overlap_warning: 'بدر — بديل الأنفال 8:9-19 مقابل آل عمران 3:123-126',
  },
  muhammad_04__: { risk_level: 'medium', overlap_warning: '33:9-22 نطاق طويل للأحزاب' },
  muhammad_05__: { risk_level: 'low', overlap_warning: '' },
};

export function getRiskMeta(eventId) {
  return (
    CONSOLIDATED_RISK_META[eventId] || {
      risk_level: 'medium',
      overlap_warning: '',
    }
  );
}
