/** @typedef {'page' | 'list'} MushafReadingMode */

/**
 * @typedef {Object} MushafSettings
 * @property {number} fontSize
 * @property {number} lineHeight
 * @property {MushafReadingMode} readingMode
 * @property {boolean} showAyahNumbers
 * @property {boolean} showReferences
 * @property {boolean} nightMode
 */

export const MUSHAF_SETTINGS_KEY = 'qsu_mushaf_settings';

/** @type {MushafSettings} */
export const DEFAULT_MUSHAF_SETTINGS = {
  fontSize: 24,
  lineHeight: 1.9,
  readingMode: 'page',
  showAyahNumbers: true,
  showReferences: true,
  nightMode: false,
};

/**
 * @returns {MushafSettings}
 */
export function loadMushafSettings() {
  try {
    const raw = localStorage.getItem(MUSHAF_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_MUSHAF_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MUSHAF_SETTINGS,
      ...parsed,
      fontSize: clampNumber(parsed.fontSize, 16, 40, DEFAULT_MUSHAF_SETTINGS.fontSize),
      lineHeight: clampNumber(parsed.lineHeight, 1.4, 2.6, DEFAULT_MUSHAF_SETTINGS.lineHeight),
      readingMode: parsed.readingMode === 'list' ? 'list' : 'page',
    };
  } catch {
    return { ...DEFAULT_MUSHAF_SETTINGS };
  }
}

/**
 * @param {Partial<MushafSettings>} patch
 * @returns {MushafSettings}
 */
export function saveMushafSettings(patch) {
  const next = { ...loadMushafSettings(), ...patch };
  if (next.fontSize != null) {
    next.fontSize = clampNumber(next.fontSize, 16, 40, DEFAULT_MUSHAF_SETTINGS.fontSize);
  }
  if (next.lineHeight != null) {
    next.lineHeight = clampNumber(next.lineHeight, 1.4, 2.6, DEFAULT_MUSHAF_SETTINGS.lineHeight);
  }
  if (next.readingMode && next.readingMode !== 'list') {
    next.readingMode = 'page';
  }
  localStorage.setItem(MUSHAF_SETTINGS_KEY, JSON.stringify(next));
  return next;
}

/**
 * @param {HTMLElement} root
 * @param {MushafSettings} settings
 */
export function applyMushafSettingsToDom(root, settings) {
  const reading = root.querySelector('.mushaf-reading-area');
  if (reading) {
    reading.style.setProperty('--mushaf-font-size', `${settings.fontSize}px`);
    reading.style.setProperty('--mushaf-line-height', String(settings.lineHeight));
  }
  root.classList.toggle('mushaf-night', settings.nightMode);
  root.classList.toggle('mushaf-mode-page', settings.readingMode === 'page');
  root.classList.toggle('mushaf-mode-list', settings.readingMode === 'list');
  root.classList.toggle('mushaf-hide-ayah-numbers', !settings.showAyahNumbers);
  root.classList.toggle('mushaf-hide-references', !settings.showReferences);
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 */
function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
