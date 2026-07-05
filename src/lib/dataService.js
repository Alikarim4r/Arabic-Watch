/** @typedef {import('./repository.js').Repository} Repository */

/** @type {'local'|'supabase'} */
let provider = 'local';

/** @type {Repository|null} */
let repository = null;

/** @type {boolean} */
let publicMode = true;

const config = {
  supabaseUrl: '',
  supabaseKey: '',
};

/**
 * @param {{ provider?: 'local'|'supabase', publicMode?: boolean, supabaseUrl?: string, supabaseKey?: string }} options
 */
export function configure(options = {}) {
  if (options.provider) provider = options.provider;
  if (typeof options.publicMode === 'boolean') publicMode = options.publicMode;
  if (options.supabaseUrl) config.supabaseUrl = options.supabaseUrl;
  if (options.supabaseKey) config.supabaseKey = options.supabaseKey;
  repository = null;
}

export function isPublicMode() {
  return publicMode;
}

/**
 * @returns {Promise<Repository>}
 */
export async function getRepository() {
  if (repository) return repository;

  if (provider === 'supabase') {
    throw new Error(
      'Supabase provider is not wired yet. Set provider to "local" or implement supabaseRepository.js.'
    );
  }

  const { loadLocalRepository } = await import('./localJsonRepository.js');
  repository = await loadLocalRepository();
  return repository;
}

/**
 * Filter content for public display — unapproved items remain visible but flagged.
 * @param {{ review_status?: string }} item
 */
export function isApprovedForPublic(item) {
  return item?.review_status === 'approved';
}

/**
 * Whether summary text should be shown as final verified content.
 * @param {{ review_status?: string, source_status?: string }} item
 */
export function isFinalContent(item) {
  if (!publicMode) return true;
  return item?.review_status === 'approved' && item?.source_status !== 'none';
}

export async function getGraphData() {
  const repo = await getRepository();
  const [nodes, links, themes] = await Promise.all([
    repo.getNodes(),
    repo.getLinks(),
    repo.getThemes(),
  ]);
  return { nodes, links, themes };
}

export async function getStoryBundle(nodeId) {
  const repo = await getRepository();
  const [node, events, eventAyahs, themes, tafsirSources] = await Promise.all([
    repo.getNodeById(nodeId),
    repo.getEventsByNode(nodeId),
    repo.getEventAyahs(),
    repo.getThemes(),
    repo.getTafsirSources(),
  ]);

  return { node, events, eventAyahs, themes, tafsirSources };
}

export async function searchContent(query, filters = {}) {
  const repo = await getRepository();
  const { searchIndex } = await import('../features/search/searchEngine.js');
  const [nodes, events, themes, surahs] = await Promise.all([
    repo.getNodes(),
    repo.getEvents(),
    repo.getThemes(),
    repo.getSurahs(),
  ]);
  return searchIndex({ nodes, events, themes, surahs, query, filters, publicMode });
}
