
export class PresentationDetachInputs {
  static class_types = {
    'PresentationDropDown': true,
    'PresentationFile': true,
    'PresentationAudio': true,
    'PresentationImage': true,
    'PresentationVideo': true,
  };

  detachInputs(graph, workflows) {
    const { output, workflow } = workflows;
    for (const destNodeId in output) {
      const destNode = output[destNodeId];
      for (const inputName in destNode.inputs) {
        const input = destNode.inputs[inputName];
        if (Array.isArray(input)) {
          const sourceNodeId = input[0];
          const apiSourceNode = output[sourceNodeId];
          if (PresentationDetachInputs.class_types[apiSourceNode.class_type]) {
            const val = apiSourceNode.inputs.value;
            destNode.inputs[inputName] = val;
          }
        }
      }
    }
    return workflows;
  }

  init(app) {
    if (app.pres_origGraphToPrompt) {
      return;
    }
    const origGraphToPrompt = app.graphToPrompt;
    app.pres_origGraphToPrompt = origGraphToPrompt;
    app.graphToPrompt = (...args) => {
      return origGraphToPrompt.apply(app, args).then(
        (workflows) => this.detachInputs(app.graph, workflows)
      );
    };
  }
}
