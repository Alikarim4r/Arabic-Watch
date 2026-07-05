/** Lightweight pub/sub app state */

const listeners = new Set();

/** @type {Object} */
const state = {
  activeView: 'home',
  selectedNodeId: null,
  selectedEventId: null,
  studyTarget: null,
  graphFilters: {
    nodeType: '',
    surahId: '',
    themeId: '',
    placeId: '',
    query: '',
  },
  searchFilters: {
    mode: 'normalized',
    type: '',
    themeId: '',
    surahId: '',
    reviewStatus: '',
  },
  graphPaused: false,
  loading: true,
  error: null,
};

export function getState() {
  return state;
}

/** @param {Partial<typeof state>} patch */
export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

/** @param {(s: typeof state) => void} fn */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function navigate(view, payload = {}) {
  setState({ activeView: view, ...payload });
}
