/** @typedef {import('./repository.js').Repository} Repository */

/** @typedef {'local'|'supabase'} ProviderMode */

/** @type {ProviderMode} */
let provider = 'local';

/** @type {Repository|null} */
let repository = null;

/** @type {boolean} */
let publicMode = true;

const config = {
  supabaseUrl: '',
  supabaseKey: '',
  dataMode: 'local',
};

/**
 * @param {{ provider?: ProviderMode, dataMode?: ProviderMode, publicMode?: boolean, supabaseUrl?: string, supabaseKey?: string, supabaseAnonKey?: string }} options
 */
export function configure(options = {}) {
  if (options.provider) provider = options.provider;
  if (options.dataMode) {
    config.dataMode = options.dataMode;
    provider = options.dataMode;
  }
  if (typeof options.publicMode === 'boolean') publicMode = options.publicMode;
  if (options.supabaseUrl) config.supabaseUrl = options.supabaseUrl;
  if (options.supabaseKey) config.supabaseKey = options.supabaseKey;
  if (options.supabaseAnonKey) config.supabaseKey = options.supabaseAnonKey;
  repository = null;
}

export function isPublicMode() {
  return publicMode;
}

export function getDataMode() {
  return config.dataMode || provider;
}

/**
 * @returns {Promise<Repository>}
 */
export async function getRepository() {
  if (repository) return repository;

  const { createRepository } = await import('../data/repositories/repositoryFactory.js');
  repository = await createRepository({
    dataMode: config.dataMode || provider,
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseKey,
  });
  return repository;
}

/**
 * @param {{ review_status?: string }} item
 */
export function isApprovedForPublic(item) {
  return item?.review_status === 'approved';
}

/**
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
