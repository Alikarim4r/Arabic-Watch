/** @typedef {'approved'|'pending'|'needs_source'} ReviewStatus */
/** @typedef {'cited'|'pending'|'none'} SourceStatus */

/**
 * @typedef {Object} StoryNode
 * @property {string} id
 * @property {string} node_type
 * @property {string} name_ar
 * @property {string} [name_en]
 * @property {string} [short_title_ar]
 * @property {string} [summary_ar]
 * @property {ReviewStatus} [review_status]
 * @property {SourceStatus} [source_status]
 * @property {'precise_evidence'|'needs_precise_mapping'} [evidence_status]
 * @property {'quran_explicit'|'tafsir_based'|'scholarly_inference'|'needs_review'} [evidence_confidence]
 */

/**
 * @typedef {Object} StoryEvent
 * @property {string} id
 * @property {string} node_id
 * @property {string} title_ar
 * @property {string} summary_ar
 * @property {number} event_order
 * @property {string} [certainty_level]
 * @property {ReviewStatus} [review_status]
 * @property {SourceStatus} [source_status]
 * @property {'precise_evidence'|'needs_precise_mapping'} [evidence_status]
 * @property {'quran_explicit'|'tafsir_based'|'scholarly_inference'|'needs_review'} [evidence_confidence]
 * @property {string[]} [theme_ids]
 * @property {string[]} [lessons_ar]
 * @property {Object[]} [sources]
 */

/**
 * @typedef {Object} Repository
 * @property {() => Promise<Object>} loadAll
 * @property {() => Promise<StoryNode[]>} getNodes
 * @property {() => Promise<StoryEvent[]>} getEvents
 * @property {(id: string) => Promise<StoryNode|null>} getNodeById
 * @property {(id: string) => Promise<StoryEvent|null>} getEventById
 * @property {(nodeId: string) => Promise<StoryEvent[]>} getEventsByNode
 * @property {() => Promise<Object[]>} getLinks
 * @property {() => Promise<Object[]>} getEventAyahs
 * @property {() => Promise<Object[]>} getThemes
 * @property {() => Promise<Object[]>} getSurahs
 * @property {() => Promise<Object[]>} getTafsirSources
 * @property {() => Promise<Object[]>} getEras
 * @property {() => Promise<'local'|'supabase'>} [getProvider]
 * @property {() => Promise<boolean>} [isQuranTextImported]
 * @property {() => Promise<Object|null>} [getQuranTextMeta]
 * @property {(surahId: number, ayahNumber: number) => Promise<Object>} [getAyah]
 * @property {(surahId: number, ayahFrom: number, ayahTo: number) => Promise<Object[]>} [getAyahRange]
 * @property {(surahId: number) => Promise<Object[]>} [getSurahAyahs]
 * @property {(surahId: number, ayahFrom: number, ayahTo: number) => Promise<'available'|'partial'|'missing'>} [getAyahRangeTextStatus]
 * @property {(payload: Object) => Promise<Object>} [submitReviewAction]
 * @property {(recordType: string, recordId: string) => Promise<Object[]>} [getReviewActionHistory]
 * @property {(patchPayload: Object) => Promise<Object>} [submitEvidencePatch]
 * @property {(submissionId: string, status: 'approved'|'rejected', reviewerNote?: string) => Promise<Object>} [reviewEvidencePatchSubmission]
 * @property {() => Promise<Object[]>} [getStoryNodes]
 * @property {() => Promise<Object[]>} [getStoryEvents]
 * @property {() => Promise<Object[]>} [getNodeLinks]
 * @property {() => Promise<Object[]>} [getReviewQueue]
 * @property {() => Promise<Object[]>} [getContentChangeBatches]
 * @property {(batchPayload: Object) => Promise<Object>} [submitContentChangeBatch]
 * @property {(batchId: string, status: string, reviewerNote?: string) => Promise<Object>} [updateContentChangeBatchStatus]
 * @property {() => Promise<string>} [getContentSource]
 */

export {};
