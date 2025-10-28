class WaitForMessage {
  constructor() {
    this.client_id = crypto.randomUUID();
    this.eventSource = null;
  }

  restart() {
    console.log('waitForMessage.restart');
    this.close();
    this.startEventSource();
  }

  close() {
    this.eventSource?.close();
    this.eventSource = null;
  }

  static start() {
    if (!window.waitForMessageInstance) {
      window.waitForMessageInstance = new WaitForMessage();
    }

    return window.waitForMessageInstance.startEventSource();
  }

  static getInstance() {
    return window.waitForMessageInstance;
  }

  static getEvent() {
    return window.waitForMessageInstance?.eventTarget;
  }

  async startEventSource() {
    if (!this.eventTarget) {
      this.eventTarget = new EventTarget();
    }

    if (this.eventSource) {
      if (isDevMode) {
        console.info('event source already started');
      }
      return null;
    }

    return new Promise(( /* resolve */) => {
      const url = `/api/wait?client_id=${this.client_id}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (isDevMode) {
          console.log('New message:', data);
        }

        this.eventTarget.dispatchEvent(
          new CustomEvent('message',{
            detail: data
          })
        );
      };

      this.eventSource.onopen = () => {
        console.log('EventSource opened', url);
      };

      this.eventSource.onerror = (error) => {
        console.warn('EventSource failed', url, error);
      };
    });
  }

  static getClientId() {
    return WaitForMessage.getInstance().client_id;
  }
}


export default class {
  constructor() {
    this.prompt_id = null;
    this.eventSource = null;
  }

  async getHistory(prompt_id) {
    const session = await useUserSession();
    const user = session?.user;
    const query = [];
    if (user) {
      if (user?.email) {
        query.push(`subfolder=${encodeURIComponent(user.email)}`);
      }
    }
    const resp = await fetch(`/api/history/${prompt_id}?${query.join('&')}`, {});
    return await resp.json();
  }

  getHistoryOutputs(prompt_id) {
    return this.getHistory(prompt_id).then((obj) => {
      const outputs = [];
      for (const id in obj.outputs) {
        const node = obj.outputs[id];
        if (!node.images) {
          continue;
        }
        for (const image of node.images) {
          outputs.push(image);
        }
      }
    });
  }

  updateProgressNum(tab, obj) {
    if (!tab) {
      console.log('no tab for progress message');
      return false;
    }
    dispatchEvents('.pres-event-progress', 'progress', obj, tab);
    // in case someone wants to make a progress bar that appears in all tabs.
    dispatchEvents('.pres-event-progress-all', 'progress-all', obj, document);
  }

  updateProgressStatus(event) {
    if (event.type === 'status') {
      dispatchEvents('.pres-event-progress-all', 'progress-all', {
        type: "status",
        queue_remaining: event.data?.status?.exec_info?.queue_remaining
      }, document);
    }
  }

  updateProgress(tab, event) {
    if (isDevMode) {
      console.log('updateProgress', event);
    }
    if (event.type === 'progress_state') {
      const nodes = event.data.nodes;
      let max = 0;
      let value = 0;
      let nodesCount = 0;
      let nodesDone = 0;
      for(const nodeId in nodes) {
        const node = nodes[nodeId];
        max += node.max;
        value += node.value;
        ++nodesCount;
        if (node.value >= node.max) {
          ++nodesDone;
        }
      }
      this.updateProgressNum(tab, {
        loaded: value,
        total: max,
        nodesCount, nodesDone,
        type: "progress",
      });
    }
  }

  sendPreSubmit(obj, tab) {
    dispatchEvents('.pres-event-pre-submit', 'pre-submit', obj, tab);
    dispatchEvents('.pres-event-pre-submit-all-tabs', 'pre-submit-all-tabs', obj, document);
  }

  sendPostSubmit(obj, tab) {
    dispatchEvents('.pres-event-post-submit', 'post-submit', obj, tab);
    dispatchEvents('.pres-event-post-submit-all-tabs', 'post-submit-all-tabs', obj, document);
  }

  async submitTab(tab) {
    try {
      this.startWaitForFinish();

      // const target = tab;
      const inputs = tab.querySelectorAll('.pres-input');
      // we can come from ctrl-enter to get here
      const info = getTabInfo(tab);
      const params = {};
      const checkboxRadioType = { checkbox: true, radio: true };

      for (const input of inputs) {
        const id = input.getAttribute('data-workflowid');
        let valueName = input.getAttribute('data-valuename');
        if (!valueName) {
          console.warn('Cannot find data-valuename', input);
          valueName = 'value';
        }
        let valObj = params[id];
        if (!valObj) {
          valObj = params[id] = {};
        }
        if (input.tagName === 'INPUT'
          && checkboxRadioType[input.type.toLowerCase()]
        ) {
          valObj[valueName] = input.checked;
        } else if (input.tagName === 'SELECT') {
          valObj[valueName] = input.value;
        } else {
          valObj[valueName] = input.value;
        }
      }
      const bodyObj = {
        name: info.classname,
        client_id: WaitForMessage.getClientId(),
        workflow: params,
      };
      this.sendPreSubmit(bodyObj, tab);
      const presentationURL = new PresentationURL();

      const currentHash = await presentationURL.getCurrentHash();
      presentationURL.pushState(currentHash);

      if (isDevMode) {
        console.log('AddToQueue: send bodyObj', bodyObj);
      }
      const resp = await fetch(
        '/api/addQueue',
        {
          method: 'POST',
          body: JSON.stringify(bodyObj),
        },
      );

      const obj = await resp.json();
      if (resp.status !== 200 || obj.ok === false) {
        const message = obj.message || resp.statusText;
        toast.error(message);
        throw new Error(`addQueue error: ${message}`);
      }

      this.updateProgressNum(tab, {loaded: 0, total: 1000});
      // Example: { "prompt_id": "c7285143-311a-4dbd-96e7-8dece9a3303a", "number": 16, "node_errors": {} }

      if (obj.error) {
        toast.error(obj.message || obj.error.message || obj.error.type, obj);
        // throw new Error(`addQueue error: ${JSON.stringify(obj)}`);
      } else {
        this.prompt_id = obj.prompt_id;

        await this.setWaitForFinish(this.prompt_id, {
          promptId: this.prompt_id,
          tabId: info.id,
          currentHash,
        });

        this.sendPostSubmit({ prompt_id: this.prompt_id }, tab);
        toast.success('Added to queue');

        if (isDevMode) {
          console.log('resp', obj);
        }

        WaitForMessage.start();
      }
    } catch(e) {
        toast.error(`Crashed: ${e}`, e);
    }
  }

  startWaitForFinish() {
    const eventSourcePromise = WaitForMessage.start();
    if (eventSourcePromise) {
      const handleMessage = (event) => {
        const data = event?.detail;
        const promptId = data?.data?.prompt_id;
        if (!promptId) {

          if (data?.type !== 'status') {
            console.log('no prompt_id in message', data);
          }
          this.updateProgressStatus(data);
          return;
        }
        const obj = this.getWaitForFinish(promptId);
        if (!obj || !obj.tabId) {
          console.log('error not my prompt_id', promptId, window.presWaitForFinish, window.document.body);
          return;
        }
        if (isDevMode) {
          console.log('message', data, 'tab', obj.tabId);
        }
        const tab = document.getElementById(obj.tabId);

        if (data?.type === 'execution_error') {
          console.error('execution_error', data);
          toast.error(`execution_error: ${data?.exception_type}: ${data?.exception_message}`);
        } else if (data?.type === 'execution_success') {
          this.updateProgressNum(tab, {loaded: 0, total: 0});
          this.checkAllHistoryForComplete();
        } else {
          this.updateProgress(tab, data);
        }
      }
      WaitForMessage.getEvent().addEventListener(
        'message', handleMessage
      );
      onUnmounted(() => {
        WaitForMessage.getEvent().removeEventListener(handleMessage);
      });
    }
    return eventSourcePromise;
  }

  getWaitForFinish(promptId) {
    let obj = window.presWaitForFinish?.[promptId];
    if (!obj) {
      try {
        const str = window.localStorage.getItem(`waitforfinish_${promptId}`);
        if (str) {
          obj = JSON.parse(str);
        }
      } catch(e) {
        console.error('getWaitForFinish error', e);
      }
    }
    return obj;
  }

  setWaitForFinish(promptId, obj) {
    if (!window.presWaitForFinish) {
      window.presWaitForFinish = {};
    }
    window.presWaitForFinish[promptId] = obj;
    return window.localStorage.setItem(`waitforfinish_${promptId}`, 
      JSON.stringify(obj)
    );
  }

  async checkUnfinishedPrompt(unfinishedPrompts) {
    if(!hasDB()) {
      return [];
    }
    const resp = await fetch(`/api/userQueueInfo`, {});
    const removes = [];
    try {
      const { queue } = await resp.json();

      for(const promptId of unfinishedPrompts) {
        const promptInfo = queue.promptIds[promptId];
        if (!promptInfo) {
          console.error('Removing, cannot find prompt_id:', promptId);
        }
        if (!promptInfo || 
          (promptInfo.inQueue === false && promptInfo.inHistory === false)
        ) {
          console.log('prompt not in queue or history remove:', promptId);
          removes.push(promptId);
        }
      }
    } catch(e) {
      console.error('checkUnfinishedPrompt error:', e);
    }
    return removes;
  }

  async checkAllHistoryForComplete() {
    const len = window.localStorage.length;
    const removes = [];
    const unfinishedPrompts = [];
    for(let n = 0; n < len; ++n) {
      const key = window.localStorage.key(n);
      const m = /^waitforfinish_(.*)$/.exec(key);
      let val;
      if (m) {
        // const promptId = m[1];
        val = window.localStorage.getItem(key);
        try {
          const obj = JSON.parse(val);
          const p = await this.checkHistoryForComplete(
            obj.promptId, obj.tabId, obj.currentHash
          );
          if (p) {
            removes.push(key);
          } else {
            unfinishedPrompts.push(obj.promptId);
            console.log('has unfinished prompt', key, obj);
          }
        } catch(e) {
          console.error('prompt value from local storage failed', e, 'key', key, 'val', typeof val, val);
        }
      }
    }

    removes.forEach((key) => window.localStorage.removeItem(key));
    if (removes.length > 0) {
      dispatchEvents('.pres-event-update-history', 'update-history', {});
    }

    if (unfinishedPrompts.length > 0) {
      for(const r of await this.checkUnfinishedPrompt(unfinishedPrompts)) {
        removes.push(`waitforfinish_${r}`);
      }
      this.startWaitForFinish();
    }
  }

  async checkHistoryForComplete(promptId, tabId, currentHash) {
    const tab = document.getElementById(tabId);
    if (!tab) {
      console.error(`Could not find tabId: ${tabId}`);
      return null;
    }

    const info = getTabInfo(tab);
    const historyObj = await this.getHistory(promptId);
    const presentationURL = new PresentationURL();

    const p = historyObj[promptId];
    if (!p) {
      return p;
    } else {
      await presentationURL.setOutputs(
        tab, info.classname, promptId, p.outputs
      );
    }

    const outputs = presentationURL.getGlobalOutputs();
    if (outputs && Object.keys(outputs).length > 0) {
      const outputsBase64 = await CompressString.objToBase64(
        outputs,
      );

      const urlWithOutput = `${currentHash}&o=${outputsBase64}`;
      presentationURL.replaceState(currentHash, urlWithOutput);
      HistoryDB.getDB().addString(
        promptId,
        urlWithOutput,
      );
    }

    dispatchEvents('.pres-event-all-outputs', 'all-outputs', { output : p }, tab);
    console.log('prompt completed', promptId);
    return p;
  }
}

