import { join } from "node:path";

const userPaths = {
  'output': true,
  'input': true,
};
export function linkTarget(node, id, inputName, workflowData, opts) {
  const workflow_api = workflowData.workflow_api;
  let val = node.inputs[inputName];
  const inputPath = node.inputs.path;

  if (opts.userFolder && userPaths[inputPath]) {
    // link input, output
    val = join('..', inputPath, opts.userFolder, val);
  } else {
    const pathM = /^([^\/]+)\/(.*)$/.exec(inputPath);
    if (pathM) {
      // link model.  First path is the type
      val = join(pathM[2], val);
    }
  }

  // const workflowNode = workflowData.workflow.nodes.find(n => n.id == id);
  for (const nodeId in workflow_api) {
    const destNode = workflow_api[nodeId];
    for (const inputName in destNode.inputs) {
      const link = destNode.inputs[inputName];
      if (link[0] === id) {
        destNode.inputs[inputName] = val;
      }
    }
  }
}
