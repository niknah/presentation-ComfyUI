import {app} from "../../scripts/app.js"
export class PresentationSettings {
  constructor() {
    this.urlPrefix = '/custom_nodes/presentation-ComfyUI/';
    this.messageDiv = null;
  }

  emptyMessage() {
    this.setMessage('');
  }
  setMessage(message) {
    this.messageDiv.innerHTML = message;
  }
  failMessage(message) {
    console.error('settings failed', message);
    this.messageDiv.innerHTML = `X ${message}`;
  }
  okMessage(message) {
    console.log('settings ok', message);
    this.messageDiv.innerHTML = `&check; ${message}`;
  }

  async restart() {
    this.setMessage('restarting');
    const resp = await fetch(`${this.urlPrefix}restart`);
    if (resp.status === 200) {
      const obj = await resp.json();
      this.okMessage(obj.message);
    } else {
      console.error('restart failed', resp.statusMessage);
      this.failMessage(resp.statusMessage);
    }
  }

  async stop() {
    this.setMessage('stopping');
    const resp = await fetch(`${this.urlPrefix}stop`);
    if (resp.status === 200) {
      const obj = await resp.json();
      this.okMessage(obj.message);
    } else {
      console.error('stop failed', resp.statusMessage);
      this.failMessage(resp.statusMessage);
    }
  }

  async rebuild() {
    this.setMessage('rebuilding');
    const resp = await fetch(`${this.urlPrefix}rebuild`);
    if (resp.status === 200) {
      const obj = await resp.json();
      this.okMessage(obj.message);
    } else {
      console.error('rebuild failed', resp.statusMessage);
      this.failMessage(resp.statusMessage);
    }
  }

  addButton(text, func) {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.className = 'p-button mx-2';
    button.addEventListener('click', func);
    return button;
  }

  init() {
    const presentationId = 'Presentation';

    const presentationSettingsExt = {
      name: "Presentation",

      settings: [
        {
          id: `${presentationId}.restart`,
          name: "Restart",
          category: [presentationId, "restart"],
          type: () => {
            const tr = document.createElement('div');
            tr.appendChild(
              this.addButton('Stop', () => this.stop())
            );
            tr.appendChild(
              this.addButton('Restart', () => this.restart())
            );
            tr.appendChild(
              this.addButton('Rebuild', () => this.rebuild())
            );
            this.messageDiv = document.createElement('p');
            tr.appendChild(
              this.messageDiv
            );
            return tr;
          },
        }, 
      ]
    };
    console.log(presentationSettingsExt);
    app.registerExtension(presentationSettingsExt);
  }
};
