// PresentationURL
export default class {
  constructor() {
    this.presentationInputs = new PresentationInputs();
  }

  clearSrc(outputElem) {
    outputElem.dispatchEvent(new CustomEvent('clearsrcs'));
  }

  addSrc(outputElem, url) {
    outputElem.dispatchEvent(
      new CustomEvent('addsrc', {
        detail: { src: url },
      })
    );
  }
  addSrcDone(outputElem) {
    outputElem.dispatchEvent(
      new CustomEvent('addsrc', {
        detail: { done: true },
      })
    );
  }

  setGlobalOutputs(tabName, prompt_id, outputs) {
    if (!window.globalOutputs) {
      window.globalOutputs = {};
    }
    window.globalOutputs[tabName] = {prompt_id, outputs};
  }

  getGlobalOutputs() {
    return window.globalOutputs;
  }

  async setAllOutputs(allOutputs) {
    for(const tabName in allOutputs) {
      const tab = document.getElementById(`tab-${tabName}`);
      if (tab) {
        const {prompt_id, outputs } = allOutputs[tabName];
        await this.setOutputs(tab, tabName, prompt_id, outputs );
      } else {
        console.log('cannot find tab', tabName);
      }
    }
  }

  async setOutputs(tab, tabName, prompt_id, outputs) {
    this.setGlobalOutputs(tabName, prompt_id, outputs);
    let output = null;
    for (const output_id in outputs) {
      output = outputs[output_id];
      const images = output.images || output.gifs || output.audio;

      if (images) {
        const outputElem = tab.querySelector(`.workflowid-${output_id}`);
        if (outputElem) {
          this.clearSrc(outputElem);
          for (const image of images) {
            const query = [
              `prompt_id=${prompt_id}`,
              `filename=${encodeURIComponent(image.filename)}`,
              `subfolder=${encodeURIComponent(image.subfolder)}`,
              `type=${encodeURIComponent(image.type)}`,
            ].join('&');

            const imageURL = `/api/view?${query}`;
            this.addSrc(outputElem, imageURL);
            if (isDevMode) {
              console.log('imageURL', imageURL);
            }
            dispatchEvents('.pres-addsrc', 'pres-addsrc', { imageURL }, tab);
          }
          this.addSrcDone(outputElem);
        } else {
          toast.error(`Cannot find output. Workflow node id: ${output_id}`);
        }
      } else {
        dispatchEvents('.pres-addoutput', 'addoutput', { output }, tab);
        if (!output.text) {
          toast.error(`Does not support output yet, node id: ${output_id}`, output);
        }
      }
    }
  }

  async loadFromHash(hash) {
    const hashParams = new URLSearchParams(hash || location.hash.substring(1));
    const i = hashParams.get('i');
    if ((i ?? false) !== false) {
      this.presentationInputs.base64ToInputs(i);
    }

    const o = hashParams.get('o');
    if (o) {
      const outputs = await CompressString.base64ToObj(o);
      await this.setAllOutputs(outputs);
    }

    const tabName = hashParams.get('t');
    if (tabName) {
      const tabsMainContainer = document.querySelector('.pres-tabs-main-container');
      tabsMainContainer.dispatchEvent(
        new CustomEvent('change-tab', {
          detail: {
            tabName,
          }
        })
      );
    }
  }

  getTabName() {
    return document.querySelector('.pres-tabs-main-container').getAttribute('data-opened-tab');
  }

  getCurrentHash() {
    return this.presentationInputs.inputsToBase64().then((base64) => {
      const hashParams = new URLSearchParams(); // location.hash?.substring(1) || '');
      hashParams.set('t', this.getTabName());

      hashParams.set('i', base64);
      return '#' +  hashParams.toString();
    });
  }

  getCurrentTabHash(tab, tabName) {
    return this.presentationInputs.tabInputsToBase64(tab, tabName)
    .then((base64) => {
      const hashParams = new URLSearchParams(); // location.hash?.substring(1) || '');
      hashParams.set('t', this.getTabName());

      hashParams.set('i', base64);
      return '#' +  hashParams.toString();
    });
  }

  async replaceState(hashOrig, newHash) {
    const stateHash = location.hash;
    if (stateHash === hashOrig) {
      history.replaceState({}, "", newHash);
    }
  }

  async pushState(hashOrig) {
    const hash = hashOrig || (await this.getCurrentHash());
    if (hash !== location.hash) {
      const url = URL.parse(location.href);
      url.hash = hash;
      history.pushState({}, "", url.toString());
    }
  }
}
