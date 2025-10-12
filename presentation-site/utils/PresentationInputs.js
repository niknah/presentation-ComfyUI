export default class {
  serializeTabInputs(tab) {
    const inputs = {};
    for (const input of tab.querySelectorAll('.pres-input')) {
      const workflowId = input.getAttribute('data-workflowid');
      const name = input.getAttribute('data-valuename');
      if (workflowId && name) {
        let obj = inputs[workflowId];
        if (!obj) {
          obj = inputs[workflowId] = {};
        }
        let val;
        if (input.type === 'checkbox') {
          val = input.checked;
        } else {
          val = input.value;
        }
        obj[name] = val;
      }
    }
    return inputs;
  }

  serializeAllTabInputs() {
    const objs = {};
    for (const tab of document.querySelectorAll('.pres-tab-container')) {
      const name = tab.getAttribute('data-classname');
      objs[name] = this.serializeTabInputs(tab);
    }
    return objs;
  }

  deserializeToAllTabInputs(objs) {
    for (const tab of document.querySelectorAll('.pres-tab-container')) {
      const name = tab.getAttribute('data-classname');
      const obj = objs[name];
      if (!obj) {
        console.warn('Cannot find tab from save', name);
        continue;
      }
      this.deserializeToTabInputs(tab, obj);
    }
  }

  deserializeToTabInputs(tab, obj) {
    for (const input of tab.querySelectorAll('.pres-input')) {
      const workflowId = input.getAttribute('data-workflowid');
      const name = input.getAttribute('data-valuename');
      const item = obj[workflowId];
      const val = item?.[name];
      if (val !== undefined) {
        if (input.type === 'checkbox') {
          input.checked = val;
        } else {
          input.value = val;
          if (input.value !== val) {
            // console.log('select does not have this value html, will use data-loadedvalue later:', input.innerHTML, 'value', val);
          }
          input.setAttribute('data-loadedvalue', val);
        }
        input.dispatchEvent(new Event('change'));
      }
    }
  }

  async tabInputsToBase64(tab, tabName) {
    const tabInputs = this.serializeTabInputs(tab);
    const inputs = {};
    inputs[tabName] = tabInputs;
    const obj = {
      inputs
    };
    return await CompressString.objToBase64(obj);
  }

  async inputsToBase64() {
    const inputs = this.serializeAllTabInputs();
    const obj = {
      inputs,
    };
    return await CompressString.objToBase64(obj);
  }

  async base64ToInputs(base64Str) {
    const json = await CompressString.base64ToObj(base64Str);
    this.deserializeToAllTabInputs(json.inputs);
    return json;
  }
}
