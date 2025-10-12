// PresentationVideo
export default class extends PresentationMediaRecorder {
  constructor() {
    super();
    this.timeSlice = 100;
  }

  async createMediaRecorder() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: true
    });

    this.mediaRecorder = new MediaRecorder(this.stream,
      {
        mimeType: this.mimeType,
        videoBitsPerSecond: 2500000,
      }
    );
  }

  getSupportedVideoMimeType() {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm'; // Fallback
  }

  getBlob() {
    return this.videoBlob;
  }

  createVideoBlob() {
    this.mimeType = this.getSupportedVideoMimeType();
    this.videoBlob = new Blob(this.chunks, { type: this.mimeType });
    
    this.blobURL = URL.createObjectURL(this.videoBlob);
    return this.videoBlob;
  }
}
