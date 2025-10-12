// import fs from 'node:fs/promises';
import workflowDatas from '~/components/tabs/WorkflowsList.js';
import serverNodes from '~/server/nodes/index.js';

class ServerNodes {
  constructor() {
    this.path = 'server_nodes';
  }

  async importServerNode(type) {
    return serverNodes[type];
  }

  processApiNode(node, id, workflowData, opts) {
    return this.importServerNode(node.class_type).then((serverNode) => {
      if (serverNode?.processApiNode) {
        return serverNode.processApiNode(node, id, workflowData, opts);
      }
    });
  }

  processWorkflowNode(node, workflowData, opts) {
    return this.importServerNode(node.type).then((serverNode) => {
      if (serverNode?.processWorkflowNode) {
        return serverNode.processWorkflowNode(node, workflowData, opts);
      }
    });
  }
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userFolder = getUserFolder(session);

  const body = await readBody(event);
  const postObj = JSON.parse(body);
  const client_id = postObj.client_id;
  const name = fixTypeName(postObj.name);
  const workflowData = workflowDatas[name];
//  const data = await fs.readFile(`components/tabs/${name}/workflow.json`, 'utf8');
//  const workflowData = JSON.parse(data);
  const { workflow_api, workflowIds, price } = workflowData;

  if(hasDB()) {
    const { queueAmount } = await updateUserPromptsDB(userFolder);
    const user = await new UsersDB().getUser(userFolder);
    const userAmount = user?.amount || 0;
    const totalCanSpend = (userAmount - queueAmount);
    if (totalCanSpend < price) {
      const message = `Not enough credits.  In queue: $${centsToCurrency(queueAmount)}, Account: $${centsToCurrency(userAmount)}, Cost: $${centsToCurrency(price)}`;
      console.warn(userFolder, message);

      throw createError({
        statusCode: 500,
        statusMessage: "Not enough credits",
        data: { ok: false, message }
      });
    }
  }

  const serverNodes = new ServerNodes();
  for (const num in postObj.workflow) {
    if (!workflowIds[num]) {
      if (workflow_api[num]) {
        console.error('Not allowed to change this node', num);
      } else {
        console.error('Cannot find node', num);
      }
      continue;
    }
    const node = workflow_api[num];
    if (!node) {
      console.error('no node in workflow_api. id:', num, postObj.name, workflow_api);
      continue;
    }
    const val = postObj.workflow[num];
    if (!node.inputs) {
      console.error('no inputs:', node);
    }
    for (const vname in val) {
      node.inputs[vname] = val[vname];
    }
    await serverNodes.processApiNode(
      node, num, workflowData,
      {postObj, userFolder}
    );
  }
  if (workflowData.workflow?.nodes) {
    for (const node of workflowData.workflow.nodes) {
      await serverNodes.processWorkflowNode(node, workflowData, postObj);
    }
  }
  if (isDevMode) {
    // console.log('workflow_api', JSON.stringify(workflow_api, null, 4));
  }
  const prompt = { prompt: workflow_api, client_id };

//  prompt.prompt.save_image_websocket_node = {
//        "class_type": "SaveImageWebsocket",
//        "inputs": {
//            "images": [
//                "8",
//                0
//            ]
//        }
//    };

  const resp =await fetchComfy(`${comfyUrl()}/prompt`, {
    method: 'POST',
    body: JSON.stringify(prompt),
  });
  if (resp.status !== 200) {
    console.error('Prompt failed', resp, JSON.stringify(prompt, null, 4));
    const statusMessage = `Prompt failed: ${resp.status} ${resp.statusText}, ${await resp.text()}`;
    throw createError({
      statusCode: 500,
      statusMessage,
      data: { ok: false, message: statusMessage }
    });
  }

  const obj = await resp.json();
  if(hasDB()) {
    const prompt_id = obj.prompt_id;

    // do this in background or else we won't get the prompt id for the websocket quickly enough
    await (new PromptDB().addPromptToQueue(userFolder, 
    {
      prompt_id,
      price,
    }));
  }
  return obj;
});
