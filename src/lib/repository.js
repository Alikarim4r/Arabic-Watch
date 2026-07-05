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
 * @property {(payload: { contentType: string, contentId: string, action: string, note?: string, reviewerName?: string }) => Promise<Object>} [submitReviewAction]
 */

export {};
