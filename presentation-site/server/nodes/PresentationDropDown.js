import { linkTarget } from './lib/linkTarget.js';

export function processApiNode(node, id, workflowData, opts) {
  const optsNew = {...opts};
  delete optsNew.userFolder;
  linkTarget(node, id, 'value', workflowData, optsNew);
}
