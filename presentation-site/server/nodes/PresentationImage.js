import { linkTarget } from './lib/linkTarget.js';

export function processApiNode(node, id, workflowData, opts) {
  linkTarget(node, id, 'value', workflowData, opts);
}
