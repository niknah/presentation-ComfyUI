/* globals LiteGraph */
import {app} from "../../scripts/app.js"
// import {api} from "../../scripts/api.js";
import {PresentationDetachInputs} from "./PresentationDetachInputs.js";
import {PresentationSettings} from "./PresentationSettings.js";

class WorkflowToTable {
  static presentationNodes = {};
  static presentationPrimitiveNodes = {
    "PresentationDropDown": true,
    "Note": true,
    "MarkdownNote": true,
  };
  static presentationInputNodes = {
    "PresentationFile": true,
    "PresentationAudio": true,
    "PresentationVideo": true,
    "PresentationImage": true,
    "PresentationSeed": true,
    "PresentationAddQueue": true,
  };
  static presentationOutputNodes = {
    "PreviewImage": true,
    "SaveImage": true,
    "PreviewAudio": true,
    "SaveAudio": true,
    "SaveVideo": true,
    "VHS_VideoCombine": true,
  };
  static presentationMiscNodes = {
    "PresentationProgress": true,
    "PresentationComponent": true,
    "PresentationAdvancedSection": true,
  }
  static ignoreNodes = {
    "PresentationTab": true
  };

  static makePresentationNodes() {
    Object.assign(
      WorkflowToTable.presentationNodes,
      WorkflowToTable.presentationPrimitiveNodes,
      WorkflowToTable.presentationInputNodes,
      WorkflowToTable.presentationOutputNodes,
      WorkflowToTable.presentationMiscNodes,
    );
  }

  findGroupOfNode(node, groups) {
    const x = node.pos[0] + node.size[0] / 2;
    const y = node.pos[1] + node.size[1] / 2;
    for (const group of groups) {
      const isInside = LiteGraph.isInsideRectangle(
        x, y,
        group.bounding[0],
        group.bounding[1],
        group.bounding[2],
        group.bounding[3]
      );
      if (isInside) {
        return group;
      }
    }
    return null;
  }

  getBoxFromNode(node) {
    const left = node.pos[0];
    const right = left + node.size[0];
    const top = node.pos[1];
    const bottom = top + node.size[1];
    return {left, top, right, bottom};
  }

  getHorzNodeGaps(nodes) {
    return nodes.map((node) => {
      const nodeBox = this.getBoxFromNode(node);
      return {
        left:nodeBox.top,
        right:nodeBox.bottom,
        top:nodeBox.left,
        bottom:nodeBox.right,
      };
    });
  }

  getVertNodeGaps(nodes) {
    return nodes.map((node) => {
      const nodeBox = this.getBoxFromNode(node);
      return {
        left:nodeBox.left,
        right:nodeBox.right,
        top:nodeBox.top,
        bottom:nodeBox.bottom,
      };
    });
  }

  findGaps(nodeGaps) {
    const vertGaps = nodeGaps.map((nodeBox) => {
      let closestBelow = Number.MAX_VALUE;
      for (const nBox of nodeGaps) {
        if (
          (nodeBox.left <= nBox.left && nBox.left < nodeBox.right)
          || (nodeBox.left <= nBox.right && nBox.right < nodeBox.right)
          || (nBox.left < nodeBox.left && nodeBox.right < nBox.right)
        ) {
          if (nBox.top < closestBelow && nBox.top > nodeBox.bottom) {
            closestBelow = nBox.top;
          }
        }
      }
      return [nodeBox.bottom, closestBelow];
    });

    for (const gap of vertGaps) {
      for (const thinGap of vertGaps) {
        if (gap[0] < thinGap[0] && thinGap[0] < gap[1]) {
          gap[0] = thinGap[0];
        }
        if (gap[0] < thinGap[1] && thinGap[1] < gap[1]) {
          gap[1] = thinGap[1];
        }
      }
    }

    const vertGapsHash = vertGaps.reduce((a, gap) => {
      a[`${gap[0]},${gap[1]}`]=true;
      return a;
    }, {});
    const finalVertGaps = Object.keys(vertGapsHash).map(
      (gapStr) => gapStr.split(',')
    );
    finalVertGaps.sort((a,b) => {
      return a[0] - b[0];
    });
    return finalVertGaps;
  }

  findNthGap(pos, vertGaps) {
    let row = 0;
    for (const gap of vertGaps) {
      if (pos < gap[1]) {
        break;
      }
      ++row;
    }
    return row;
  }

  mapRowNumbers(nodes) {
    const nodeInfos = {}
    const rows = [];

    const horzGaps = this.findGaps(this.getHorzNodeGaps(nodes));
    const vertGaps = this.findGaps(this.getVertNodeGaps(nodes));
    for (const node of nodes) {
      const info = {node};
      nodeInfos[node.id] = info;

      const nodeBox = this.getBoxFromNode(node);
      const topRow = this.findNthGap(nodeBox.top, vertGaps);
      const bottomRow = this.findNthGap(nodeBox.bottom, vertGaps);
      const leftCol = this.findNthGap(nodeBox.left, horzGaps);
      const rightCol = this.findNthGap(nodeBox.right, horzGaps);

      let rowArr = rows[topRow];
      if (!rowArr) {
        rowArr = rows[topRow] = [];
      }
      info.row = topRow;
      info.rowSpan = (bottomRow - topRow) + 1;
      info.col = leftCol;
      info.colSpan = (rightCol - leftCol) + 1;
      rowArr[info.col] = info;
    }
    return { nodeInfos, rows, horzGaps, vertGaps };
  }

  makeTable(nodes) {
    const {rows, horzGaps, vertGaps} = this.mapRowNumbers(nodes);
    const tableRows = [];
    for (const rowNodeInfos of rows) {
      const tableRow = [];
      for (const nodeInfo of rowNodeInfos) {
        tableRows.push(nodeInfo?.node);
      }
      tableRows.push(tableRow);
    }
    return {tableRows, rows, horzGaps, vertGaps};
  }

  static getPresentationPrice(presentationTab) {
    return Number.parseInt(presentationTab?.widgets_values?.[1]);
  }

  static getPresentationTabName(presentationTab) {
    return presentationTab?.widgets_values?.[0];
  }

  getGroupInfos(workflow) {
    const groupInfos = { };
    const presentationTabs = workflow.nodes.filter((node) => {
      return (WorkflowToTable.ignoreNodes[node.type]);
    });
    for (const presentationNodeId in presentationTabs) {
      const presentationTab = presentationTabs[presentationNodeId];
      const group = this.findGroupOfNode(presentationTab, workflow.groups);
      if (group) {
        groupInfos[group.id] = {
          nodes: [],
          group,
          presentationTab,
        };
      }
    }

    for (const node of workflow.nodes) {
//      if (node && WorkflowToTable.okNodes[node.type]) {
      if (node && !WorkflowToTable.ignoreNodes[node.type]) {
        const group = this.findGroupOfNode(node, workflow.groups);
        if (group) {
          const groupInfo = groupInfos[group.id];
          if (groupInfo) {
            groupInfo.nodes.push(node);
          }
        }
      }
    }
    // console.log('groupInfos',groupInfos);
    return groupInfos;
  }
}

class ComfyToVueType {
  constructor() {
    const numberType = {
      type:'Number',
      html:(widget_id, v_input_name, input_name) => { 
        return {
          html:`<span class='pres-number-wrapper'><input type='number' :size="size_${input_name}" :data-workflowid="id" class="pres-input pres-number-input" data-valuename="${input_name}" :value="${v_input_name}" /></span>`,
        }
      },
      scriptLine:(widget_id, v_input_name, input_name) => { return `const size_${input_name} = props.size || props.value0?.toString()?.length`; },
    };
    const stringType = {
      type:'String',
      html:(widget_id, v_input_name, input_name) => {
        return {
          html:`<input type='text' class="pres-input pres-text-input" :data-workflowid="id" data-valuename="${input_name}" :value="${v_input_name}" />`,
        };
      },
    };
    const textBoxType = {
      type:'String',
      html:(widget_id, v_input_name, input_name) => {
        return {
          html:`<span class="pres-textarea-wrapper"><textarea class="pres-input pres-textarea" :data-workflowid="id" data-valuename="${input_name}" :value="${v_input_name}"></textarea></span>`,
        };
      },
      scriptLine:(widget_id, v_input_name, input_name) => {
        if (input_name === 'value') {
          return `const r_${input_name} = ref(props.${v_input_name});\n`;
        }
        return ''; 
      },
    };
    const toggleType = {
      type:'Boolean',
      html:(widget_id, v_input_name, input_name) => {
        return {
          html:`<span class="pres-checkbox-wrapper"><input type='checkbox' :data-workflowid="id" class="pres-input pres-checkbox" data-valuename="${input_name}" :checked="${v_input_name}" /></span>`,
        };
      },
    };
    const comboType = {
      type:'String',
      html:(widget_upto, v_input_name, input_name /*, widget */) => {
        const optionsId = `options_${input_name}`;
        return {
          html:`<span class="pres-select-wrapper"><select :data-workflowid="id" class="pres-input" data-valuename="${input_name}" :value="${v_input_name}"><option v-for="option in ${optionsId}">{{option}}</option></select></span>`,
        };
      },
    };
    this.comfyToVueTypeMap = {
      'number':numberType,
      'toggle':toggleType,
      'text':stringType,
      'customtext':textBoxType,
      'combo':comboType,
    };
  }

  comfyToVueType(type) {
    return this.comfyToVueTypeMap[type];
  }
}

class PresentationTab {

  constructor() {
    this.onChangeTimeoutId = null;
    this.prevWorkflow = null;
    this.presentationNodes = {};
    this.prevPromptStr = null;
    this.comfyToVueType = new ComfyToVueType();
    // this.debug = true;
  }

  static getNodeClass() {
    return 'PresentationTab';
  }

  getWidgetFromLinkId(graph, destLinkId) {
    const link = graph.links[destLinkId];
    const destNodeId = link.target_id;
    const destNodeSlot = link.target_slot;
    const destNode = graph.getNodeById(destNodeId);
    if (!destNode) {
      return null;
    }
    const name = destNode.inputs[destNodeSlot]?.name;
    for (const widget of destNode.widgets) {
      if (widget.name === name) {
        return widget;
      }
    }
    return null;
  }

  fixTypeName(name) {
    return name.replace(/[^a-zA-Z0-9_]/g,'');
  }

  getCamelName(name) {
    return name.substring(0,1).toUpperCase()
      + name.substring(1).toLowerCase();
  }

  getGraphNodeInfo(graphNode) {
    const inputsByName = {};
    for (const input of graphNode.inputs) {
      inputsByName[input.name] = input;
    }
    const widgetsByName = {};
    if (graphNode.widgets) {
      for (const widget of graphNode.widgets) {
        widgetsByName[widget.name] = widget;
      }
    }
    return {
      graphNode,
      inputsByName,
      widgetsByName,
    };
  }

  makeComponent(workflowNode, graphNodeInfo /*, componentName*/) {
    const graphNode = graphNodeInfo.graphNode;

    const okWidgets = [];
    for (const widget of graphNode.widgets) {
      const input = graphNodeInfo.inputsByName[widget.name];
      if (!input) {
        console.log('widget not found in inputs', widget.name, workflowNode, graphNode);
        continue;
      }
      if (input.link) {
        continue;
      }

      const vueType = this.comfyToVueType.comfyToVueType(widget.type);
      if (!vueType) {
        continue;
      }
      okWidgets.push({widget, vueType});
    }

    const scripts = [];
    const scriptLines = [];
    const htmlInputs = [];
    let widget_upto = -1;
    const oneWidget = (okWidgets.length === 1);
    for (const widgetObj of okWidgets) {
      const {widget, vueType}=widgetObj;
      ++widget_upto;
      const input_name =  widget.name;

      const title = oneWidget ?
        '{{title}}' : input_name
      ;
      const safe_input_name = input_name.replace(/[^a-zA-Z0-9_]/g,'')
      const v_input_name = `v_${safe_input_name}`;
      scripts.push(`"${v_input_name}": { type: ${vueType.type} }`);

      const options_input_name = `options_${safe_input_name}`;
      scripts.push(`"${options_input_name}": { type: Array }`);
      if(vueType.scriptLine) {
        scriptLines.push(vueType.scriptLine(widget_upto, v_input_name, safe_input_name, widget));
      }
      const htmlInput = vueType.html(widget_upto, v_input_name, safe_input_name, widget);
      if (oneWidget) {
        htmlInputs.push(htmlInput.html);
      } else {
        htmlInputs.push(`<td class='pres-label-td'><label class='pres-node-title'>${title}</label></td><td>${htmlInput.html}</td>`);
      }
    }
    const extraScript = 'const idClass = `workflowid-${props.id}`;';
    const scr = `const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
    ${scripts.join(",\n")} }); ${scriptLines.join("\n")}\n ${extraScript}`;
    const htmlTable = oneWidget ?
      htmlInputs[0] :
      `<label class="pres-component-title">{{ title }}</label><table class='node-table'><tbody>\n<tr>${htmlInputs.join("</tr>\n<tr>")}</tr>\n</tbody></table>`
    ;
    const html = `<div :data-workflowid="id" :class=[idClass]>${htmlTable}</div>`;
    return {
      oneWidget,
      html:`<script setup>\n${scr}\n</script>\n<template>${html}</template>`
    };
  }

  quoteAttribute(value) {
    return value?.replace ? value.replace(/"/g,'&quot;') : value;
  }

  workflowToHtml(rows, graph, camelTabName) {
    const newRows = [];
    const js = [];
    const customs = {};
    let hasAddQueue = false;

    // value types that need : in the value
    const directWidgetTypes={ number: true, toggle: true };
    const ignoreWidgetTypes={ button: true };

    for (const row of rows) {
      const newRow = [];
      for (const nodeInfo of row) {
        if (!nodeInfo) {
//          newRow.push('<td colspan=2></td>');
          continue;
        }

        let tdClasses = '';
        let tdOptions = "";
        if (nodeInfo.rowSpan > 1) {
          tdOptions += ` rowspan="${nodeInfo.rowSpan}"`;
          tdClasses += ` pres-rowspan-${nodeInfo.rowSpan}`;
        }
        const nodeType = LiteGraph.registered_node_types[nodeInfo.node.type];
        const workflowNode = nodeInfo.node;
        const title = workflowNode.title || nodeType.title;

        const graphNode = graph.getNodeById(workflowNode.id);
        const graphNodeInfo = this.getGraphNodeInfo(graphNode);

        const optionsStrs = [];
        const valueStrs = [];
        const widgetsValuesLen = workflowNode.widgets_values?.length || 0;
        for (let widget_id = 0; widget_id < widgetsValuesLen; ++widget_id) {
          const widgetDef = graphNode?.widgets?.[widget_id];
          const options = widgetDef?.options?.values;
          const widget_name = widgetDef.name;
          const value = workflowNode.widgets_values.length === 0 ? '' : workflowNode.widgets_values[widget_id];

          if (options
            && (graphNodeInfo.inputsByName[widget_name] ||
              graphNodeInfo.widgetsByName[widget_name])
          ) {
            const optionsId = `options_${workflowNode.id}_${widget_name}`;
            optionsStrs.push(
              `:options_${widget_name}="${optionsId}"`
            );
            js.push(`const ${optionsId} = ${JSON.stringify(options)};`);
          }
          //if (workflowNode.widgets_values.length > 0) {
          if (value !== "" && !ignoreWidgetTypes[widgetDef.type]) {
            valueStrs.push(`${directWidgetTypes[widgetDef.type] ? ':' : ''}v_${widget_name}="${this.quoteAttribute(value)}"`);
          }
          //}
        }

        const valueStr = valueStrs.join(' ');
        const optionsStr = optionsStrs.join(' ');

        let type = 
          (workflowNode.type === "PresentationComponent") ?
            workflowNode.widgets_values[0] :
            workflowNode.type
          ;
        // type = this.getCamelName(this.fixTypeName(type));
        type = this.fixTypeName(type);
        if (type === 'PresentationAddQueue') {
          hasAddQueue = true;
        }
        let oneWidget1 = null;
        let componentName = `Node${type}`;
        if (!WorkflowToTable.presentationNodes[workflowNode.type] && !WorkflowToTable.ignoreNodes[workflowNode.type]) {
          componentName = `Tabs${camelTabName}${type}`;
          const { html, oneWidget } = this.makeComponent(workflowNode, graphNodeInfo, componentName);
          oneWidget1 = oneWidget;
          customs[type] = html;
        }

        const nodeElem = `<${componentName} id="${workflowNode.id}" title="${title}" ${valueStr} ${optionsStr} />`;
        const colSpan = nodeInfo.colSpan * (oneWidget1?1:2);
        tdOptions += ` colspan="${colSpan}"`;
        if (colSpan > 1) {
          tdClasses += ' pres-colspan-${colSpan}';
        }
        if (oneWidget1) {
          newRow.push(`<td${tdOptions} class='pres-label-td${tdClasses}'><label>${title}</label></td><td${tdOptions}>${nodeElem}</td>`);
        } else {
          newRow.push(`<td${tdOptions}>${nodeElem}</td>`);
        }
      }
      newRows.push(newRow.join("\n"));
    }
    const addQueueElem = hasAddQueue?
      '':
      '<NodePresentationAddQueue />';
    return {
      js:js.join("\n"),
      customs,
      html:`<div class='pres-container'>\n<table class="pres-table"><tbody><tr>${newRows.join("</tr>\n<tr>")}</tr></tbody></table>\n${addQueueElem}</div>`
    };
  }

  getWorkflowIdsFromRows(rows) {
    const workflowIds = {};
    for (const row of rows) {
      for (const nodeInfo of row) {
        if (nodeInfo) {
          workflowIds[nodeInfo.node.id] = true;
        }
      }
    }
    return workflowIds;
  }

  sendWorkflow(promptObj) {
    const { output, workflow } = promptObj;
    // this.cleanPresentationNodes(workflow);

    return this.getTableRows(window.app).then((rowsByGroup) => {
      for (const groupInfoId in rowsByGroup) {
        const obj = rowsByGroup[groupInfoId];
        const {rows, groupInfo}  = obj;
        console.log('workflow rows', rows);
        const workflowIds = this.getWorkflowIdsFromRows(rows);

        const price = WorkflowToTable.getPresentationPrice(groupInfo.presentationTab);
        const title = WorkflowToTable.getPresentationTabName(groupInfo.presentationTab);
        const name = this.fixTypeName(title);
        // const tabClassName = name.toLowerCase();
        const camelTabName = this.getCamelName(name);

        const { html, js, customs } = this.workflowToHtml(rows, app.graph, camelTabName);

        const generatedMessage = 'Do not edit.  Generated from presentations-ComfyUI.  Will be wiped when someone changes the workflow.';
        const template = `<!-- ${generatedMessage} -->\n<script setup>\n${js}\n</script>\n<template><div id='tab-${camelTabName}' data-classname='${camelTabName}' data-title="${encodeURIComponent(title)}" class="tab-${camelTabName} pres-tab-container">${html}</div></template>`;
        const toSave = {
          template,
          workflow:{
            workflow_api:output,
            workflowIds,
            workflow,
            price,
          },
          customs,
          title,
          camelTabName,
          name,
        };
        console.log('toSave', toSave);
        return fetch('/custom_nodes/presentation-ComfyUI/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(toSave),
        })
        .then((response) => {
          try {
            return response.json()
          } catch(e) {
            console.error('bad save response', e);
            return response.text().then((txt) => {
              console.log('text response', txt);
            });
          }
        })
        .then(data => console.log('saved', data))
        .catch(error => console.error('Error:', error));
      }
    });
  }

  checkChanges() {
    return window.app.pres_origGraphToPrompt().then((promptObj) => {
      if (promptObj.output) {
        const workflowJson = JSON.stringify(promptObj.output);
        // if (workflowJson !== this.prevWorkflow) {
          this.prevWorkflow = workflowJson;
          return this.sendWorkflow(promptObj);
        // }
      }
      return Promise.resolve();
    });
  }

  getTableRows(app) {
    return app.pres_origGraphToPrompt().then((promptObj) => {
      const promptStr = JSON.stringify(promptObj);
      // if (this.prevPromptStr !== promptStr) {
        this.prevPromptStr = promptStr;
        const workflow = promptObj.workflow;
        const workflowToTable = new WorkflowToTable();
        const groupInfos = workflowToTable.getGroupInfos(workflow);
        const rowsByGroup = {};
        for (const groupInfoId in groupInfos) {
          const groupInfo = groupInfos[groupInfoId];
          const obj = workflowToTable.makeTable(groupInfo.nodes);
          obj.groupInfo = groupInfo;
          rowsByGroup[groupInfoId] = obj;
        }
        this.prevRowsByGroup = rowsByGroup;
      // }
      return this.prevRowsByGroup;
    });
  }

  onRender(app, canvas, ctx) {
    return this.getTableRows(app).then((rowsByGroup) => {
      for (const groupInfoId in rowsByGroup) {
        const obj = rowsByGroup[groupInfoId];

        const { rows, groupInfo}  = obj;
        for (const row of rows) {
          for (const nodeInfo of row) {
            if (!nodeInfo) {
              continue;
            }
            const node = nodeInfo.node;
            ctx.save();
            app.canvas.ds.toCanvasContext(ctx);
            ctx.translate(node.pos[0], node.pos[1]-32);
            const tabName = WorkflowToTable.getPresentationTabName(groupInfo.presentationTab);
            if (this.debug) {
              ctx.fillText(`node: xy:${nodeInfo.col},${nodeInfo.row} xyspan:${nodeInfo.colSpan}x${nodeInfo.rowSpan}: name:${tabName}`, 0, 0)
            }

            ctx.restore();
          }
        }
      }
    });
  }

  initCanvas(app) {
    const oldOnRender = app.canvas.onRender;
    app.canvas.onRender = (canvas, ctx) => {
      this.onRender(app, canvas, ctx);
      if (oldOnRender) {
        return oldOnRender(canvas, ctx);
      }
    };
  }

  init() {
    const t = this;
    // api.addEventListener("graphChanged", () => this.onChangeTimeout());
    app.registerExtension({
      name: 'PresentationTab',
      async beforeRegisterNodeDef(nodeType , nodeData, app ) {
        if (nodeType.comfyClass === PresentationTab.getNodeClass()) {
          if (t.debug) {
            t.initCanvas(app);
          }
          new PresentationDetachInputs().init(app);
        }
      },
      async nodeCreated(node) {
        /*
         * TODO: window click
        node.onConnectionChange( (inOut, connected, link_info, input_info) => {
          console.log('onconenctionchange', arguments, node); // TODO
        });
        */
        if (node && node.comfyClass === PresentationTab.getNodeClass()) {
          try {
            node.addWidget('button', "Save", "", () => {
              console.log('presentation.save');
              return t.checkChanges();
            });
            t.presentationNodes[node.id] = node;
            node.onRemoved = () => {
              delete t.presentationNodes[node.id];
              console.log('removed', node);
            };
          } catch(e) {
            console.error('nodeCreated error', e);
          }
        }
      }
    });
  }
}

WorkflowToTable.makePresentationNodes();
new PresentationTab().init();

new PresentationSettings().init();
