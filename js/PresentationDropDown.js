
import {app} from "/scripts/app.js"

class PresentationDropDown {
  onConnectionsChange(node, side, slot, connect, link_info, output ) {
    // console.log("Someone changed my connection!", node, arguments);
    if (connect) {
      this.checkOutputs(node);
    }
  }

  onWidgetChanged(name, v, oldV, widget) {
    this.checkValues(widget.node);
  }

  getTarget(node) {
    const output = node.outputs[0];
    const link = output.links?.[0];
    if (link) {
      const linkObj = app.graph.links[link];
      const targetNode = app.graph.getNodeById(linkObj.target_id);
      if (targetNode) {
        const input = targetNode.inputs[linkObj.target_slot];
        const input_name = input.name;
        let nthWidget = 0;
        for (const widget of targetNode.widgets) {
          if (widget.name === input_name) {
            return {targetNode, widget, nthWidget};
          }
          ++nthWidget;
        }
      }
    }
    return null;
  }

  checkValues(node, targetInfoOrig) {
    const targetInfo = targetInfoOrig || this.getTarget(node);
    if (targetInfo) {
      const val = node.widgets[0].value;
console.log('chk set', val, node,targetInfo);
      if(val) {
        targetInfo.widget.value = val;
      }
    }
  }

  checkOutputs(node) {
    const targetInfo = this.getTarget(node);
    if (targetInfo) {
      node.widgets[0].options.values = targetInfo.widget.options.values;
    }
    this.checkValues(node, targetInfo);
  }

  getNodeClass() {
    return 'PresentationDropDown'
  }

  init() {
    const t = this;
    app.registerExtension({
      name: t.getNodeClass(),
      async beforeRegisterNodeDef(nodeType /*, nodeData, app */) {
        if (nodeType.comfyClass === t.getNodeClass()) {
          const onConnectionsChange = nodeType.prototype.onConnectionsChange;
          
          nodeType.prototype.onConnectionsChange = function (side, slot, connect, link_info, output) {
            // biome-ignore lint/style/noArguments: Using arguments with apply()
            const r = onConnectionsChange?.apply(this, arguments);
            t.onConnectionsChange(this, side, slot, connect, link_info, output);
            return r;
          }

          const onWidgetChanged = nodeType.prototype.onWidgetChanged;
          nodeType.prototype.onWidgetChanged = function (name, v, oldV, widget) {
            // biome-ignore lint/style/noArguments: Using arguments with apply()
            const r = onWidgetChanged?.apply(this, arguments);
            t.onWidgetChanged(name, v, oldV, widget);
            return r;
          };
        }
      },
      // setup
      // onNodeOutputsUpdated
      // registerCustomNodes
      // addCustomNodeDefs(defs)
      // refreshComboInNodes(defs)
      // setDefaults(maxNum?: number | null) 
      // keybindings: []
      // beforeConfigureGraph
      // In electronAdapter.ts
      //  commands []
      //  menuCommands: []
      async nodeCreated(node) {
        if (node && node.comfyClass === t.getNodeClass()) {
//          setTimeout(() => {
            try {
              // node.mode = 4; // LiteGraph.BYPASS;
              t.checkOutputs(node);
            } catch(e) {
              console.error('nodeCreated error', e);
            }
//          }, 0);
        }
      }
    });
  }
}

new PresentationDropDown().init();
