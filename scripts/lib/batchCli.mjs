import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * @param {string[]} argv
 * @param {{ input?: string, output?: string, proposed?: string }} defaults
 */
export function parseBatchCliArgs(argv, defaults = {}) {
  const result = { root, ...defaults };

  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' && argv[i + 1]) {
      result.input = argv[++i];
    } else if (arg === '--output' && argv[i + 1]) {
      result.output = argv[++i];
    } else if (arg === '--proposed' && argv[i + 1]) {
      result.proposed = argv[++i];
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    }
  }

  if (!result.input && positional[0]) result.input = positional[0];
  if (!result.output && positional[1]) result.output = positional[1];
  if (!result.proposed && positional[2]) result.proposed = positional[2];

  for (const key of ['input', 'output', 'proposed']) {
    if (result[key] && !result[key].startsWith('/')) {
      result[key] = join(root, result[key]);
    }
  }

  return result;
}

/**
 * @param {string} templatePath
 */
export function defaultProposedPathForTemplate(templatePath) {
  return templatePath.replace(/\.review_template\.json$/, '.proposed.json');
}
