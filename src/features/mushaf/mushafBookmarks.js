export const MUSHAF_LAST_READ_KEY = 'qsu_mushaf_last_read';
export const MUSHAF_BOOKMARKS_KEY = 'qsu_mushaf_bookmarks';

/**
 * @typedef {Object} MushafPosition
 * @property {number} surahId
 * @property {number} ayahFrom
 * @property {number} [ayahTo]
 * @property {string} [label]
 * @property {number} [savedAt]
 */

/**
 * @returns {MushafPosition|null}
 */
export function getLastReadPosition() {
  try {
    const raw = localStorage.getItem(MUSHAF_LAST_READ_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.surahId || !parsed?.ayahFrom) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * @param {MushafPosition} position
 */
export function saveLastReadPosition(position) {
  const payload = {
    surahId: Number(position.surahId),
    ayahFrom: Number(position.ayahFrom),
    ayahTo: Number(position.ayahTo ?? position.ayahFrom),
    label: position.label || '',
    savedAt: Date.now(),
  };
  localStorage.setItem(MUSHAF_LAST_READ_KEY, JSON.stringify(payload));
  return payload;
}

/**
 * @returns {MushafPosition[]}
 */
export function getBookmarks() {
  try {
    const raw = localStorage.getItem(MUSHAF_BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {MushafPosition} bookmark
 */
export function addBookmark(bookmark) {
  const list = getBookmarks();
  const key = bookmarkKey(bookmark);
  if (list.some((b) => bookmarkKey(b) === key)) return list;
  const next = [
    {
      surahId: Number(bookmark.surahId),
      ayahFrom: Number(bookmark.ayahFrom),
      ayahTo: Number(bookmark.ayahTo ?? bookmark.ayahFrom),
      label: bookmark.label || '',
      savedAt: Date.now(),
    },
    ...list,
  ];
  localStorage.setItem(MUSHAF_BOOKMARKS_KEY, JSON.stringify(next));
  return next;
}

/**
 * @param {MushafPosition} bookmark
 */
export function removeBookmark(bookmark) {
  const key = bookmarkKey(bookmark);
  const next = getBookmarks().filter((b) => bookmarkKey(b) !== key);
  localStorage.setItem(MUSHAF_BOOKMARKS_KEY, JSON.stringify(next));
  return next;
}

/**
 * @param {MushafPosition} bookmark
 */
export function isBookmarked(bookmark) {
  const key = bookmarkKey(bookmark);
  return getBookmarks().some((b) => bookmarkKey(b) === key);
}

/**
 * @param {MushafPosition} bookmark
 */
function bookmarkKey(bookmark) {
  return `${bookmark.surahId}:${bookmark.ayahFrom}:${bookmark.ayahTo ?? bookmark.ayahFrom}`;
}
