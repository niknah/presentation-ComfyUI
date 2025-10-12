export default class {
  constructor() {
    this.stream = null;
    this.events = new EventTarget();
    this.blobURL = null;
    this.video = null;
    this.ctx = null;
    this.canvas = null;
    this.resolution = [1920, 1080];
  }

  startRecording() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.resolution[0];
    this.canvas.height = this.resolution[1];
    this.ctx = this.canvas.getContext('2d');

    return navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: this.resolution[0] },
        height: { ideal: this.resolution[1] },
        frameRate: { ideal: 30 }
      },
    }).then((stream) => {
      this.stream = stream;
      this.mediaStream = new MediaStream(this.stream);
      return stream;
    });
  }

  stopRecording() {
    this.events.dispatchEvent(new CustomEvent('stop'));
    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
    return true;
  }

  getBlobURL() {
    return this.blobURL;
  }

  getBlob() {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        return resolve(blob);
      });
    });
  }

  createImageBlob() {
    this.ctx.drawImage(this.video, 0, 0, 
      this.resolution[0],
      this.resolution[1],
    );

    return this.getBlob().then((blob) => {
      this.imageBlob = blob;
      this.blobURL = URL.createObjectURL(this.imageBlob);
      return this.imageBlob;
    });
  }
}
