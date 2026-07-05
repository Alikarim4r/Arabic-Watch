/** @typedef {import('./repository.js').Repository} Repository */

/** @typedef {'local'|'supabase'} DataMode */

/**
 * Re-export local repository loader for backward compatibility.
 * @deprecated Use src/data/repositories/localRepository.js
 */
export { createLocalJsonRepository, loadLocalRepository } from '../data/repositories/localRepository.js';

/** @deprecated Use loadLocalRepository from src/data/repositories/localRepository.js */
export async function loadLocalRepositoryLegacy() {
  const { loadLocalRepository } = await import('../data/repositories/localRepository.js');
  return loadLocalRepository();
}
