export default class extends PresentationMediaRecorder {
  constructor() {
    super();
    this.audioContext = null;
    this.wavBuffer = null;
    this.sampleRate = 44100;
  }

  async createMediaRecorder() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: this.sampleRate,
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false
      }
    });

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: this.sampleRate
    });

    this.mediaRecorder = new MediaRecorder(this.stream);
  }

  createAudioBlob() {
    const audioBlob = new Blob(this.chunks, { type: 'audio/wav' });
    return this.convertToWAV(audioBlob).then(() => {
      this.blobURL = URL.createObjectURL(audioBlob);
    });
  }

  async convertToWAV(audioBlob) {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.wavBuffer = this.audioBufferToWav(audioBuffer);
      this.duration = audioBuffer.duration;
      this.sampleRate = audioBuffer.sampleRate;
    } catch (error) {
      console.error('Error converting to WAV:', error);
    }
  }

  audioBufferToWav(audioBuffer) {
    const numberOfChannels = 1; // Force mono
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitsPerSample = 16;

    const channelData = audioBuffer.getChannelData(0);
    const samples = new Int16Array(channelData.length);

    // Convert float32 to int16
    for (let i = 0; i < channelData.length; i++) {
      samples[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32767));
    }

    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bitsPerSample / 8, true);
    view.setUint16(32, numberOfChannels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(offset, samples[i], true);
      offset += 2;
    }

    return buffer;
  }

  getWAVBuffer() {
    return this.wavBuffer;
  }

  getBlob() {
    return new Blob([this.getWAVBuffer()], { type: 'audio/wav' });
  }


  getBufferInfo() {
    return {
      size: this.wavBuffer ? this.wavBuffer.byteLength : 0,
      duration: this.duration,
      sampleRate: this.sampleRate
    };
  }
}
