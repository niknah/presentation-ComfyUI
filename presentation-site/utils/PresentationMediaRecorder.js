export default class {
  constructor() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.duration = 0;
    this.stream = null;
    this.events = new EventTarget();
    this.blobURL = null;
  }

  getBlobURL() {
    return this.blobURL;
  }

  async startRecording() {
    try {
      await this.createMediaRecorder();
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.chunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
        this.events.dispatchEvent(new CustomEvent('stop'));
      };

      this.mediaRecorder.start(this.timeSlice);
      this.startTime = Date.now();
      return true;
    } catch (error) {
      toast.error('Error starting recording:', error);
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.duration = (Date.now() - this.startTime) / 1000;
      return true;
    }
    return false;
  }
}
