import { matchesArabicQuery, matchesAllTokens } from '../../lib/arabicNormalize.js';
import { isFinalContent } from '../../lib/dataService.js';

/**
 * @param {Object} params
 */
export function searchIndex({ nodes, events, themes, surahs, query, filters, publicMode }) {
  const q = (query || '').trim();
  const mode = filters.mode || 'normalized';
  const results = [];

  const match = (text) => {
    if (!q) return true;
    if (mode === 'exact') return matchesArabicQuery(q, text, 'exact');
    return matchesAllTokens(q, text);
  };

  const push = (item) => {
    if (filters.type && item.resultType !== filters.type) return;
    if (filters.themeId && !item.themeIds?.includes(filters.themeId)) return;
    if (filters.surahId && String(item.surahId || '') !== String(filters.surahId)) return;
    if (filters.reviewStatus && item.review_status !== filters.reviewStatus) return;
    if (publicMode && filters.onlyApproved && !isFinalContent(item)) return;
    if (q && !match(item.searchText)) return;
    results.push(item);
  };

  nodes.forEach((node) => {
    push({
      id: node.id,
      resultType: node.node_type,
      title_ar: node.name_ar,
      summary_ar: node.summary_ar || '',
      review_status: node.review_status,
      source_status: node.source_status,
      searchText: [node.name_ar, node.short_title_ar, node.summary_ar, node.name_en]
        .filter(Boolean)
        .join(' '),
      hrefType: 'node',
    });
  });

  events.forEach((event) => {
    push({
      id: event.id,
      resultType: 'event',
      title_ar: event.title_ar,
      summary_ar: event.summary_ar,
      review_status: event.review_status,
      source_status: event.source_status,
      evidence_status: event.evidence_status,
      evidence_confidence: event.evidence_confidence,
      themeIds: event.theme_ids || [],
      searchText: [event.title_ar, event.summary_ar, ...(event.lessons_ar || [])].join(' '),
      hrefType: 'event',
      node_id: event.node_id,
    });
  });

  themes.forEach((theme) => {
    push({
      id: theme.id,
      resultType: 'theme',
      title_ar: theme.name_ar,
      summary_ar: theme.description_ar || '',
      review_status: theme.review_status,
      searchText: [theme.name_ar, theme.description_ar].filter(Boolean).join(' '),
      hrefType: 'theme',
    });
  });

  surahs.forEach((surah) => {
    push({
      id: String(surah.id),
      resultType: 'surah',
      title_ar: surah.name_ar,
      summary_ar: `${surah.ayah_count} آية • ${surah.revelation_type === 'makkah' ? 'مكية' : 'مدنية'}`,
      surahId: surah.id,
      searchText: [surah.name_ar, surah.name_en, String(surah.id)].filter(Boolean).join(' '),
      hrefType: 'surah',
      review_status: 'approved',
    });
  });

  return results;
}
