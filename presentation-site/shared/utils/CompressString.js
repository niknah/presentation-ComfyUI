export default class {
  static uint8ArrayToBase64Reduce(uint8Array) {
    const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binaryString);
  }

  // Reverse operation: Base64 to Uint8Array
  static base64ToUint8Array(base64) {
    try  {
      const binaryString = atob(base64);
      const uint8Array = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      return uint8Array;
    } catch (e) {
      console.error('base64ToUint8Array', e, base64);
    }
  }

  static async objToBase64(obj) {
    return this.uint8ArrayToBase64Reduce(
      await this.compressString(JSON.stringify(obj))
    );
  }

  static async base64ToObj(base64Str) {
    const str = await this.decompressString(
      this.base64ToUint8Array(base64Str.replace(/ /g,' +'))
    );
    return JSON.parse(str);
  }

  // Function to compress a string using CompressionStream
  static async compressString(text, format = 'gzip') {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Create compression stream
    const compressionStream = new CompressionStream(format);

    // Create a readable stream from the data
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      }
    });

    // Pipe through compression stream
    const compressedStream = readable.pipeThrough(compressionStream);

    // Read the compressed data
    const compressedData = await new Response(compressedStream).arrayBuffer();

    return new Uint8Array(compressedData);
  }

  // Function to decompress back to string
  static async decompressString(compressedData, format = 'gzip') {
    // Create decompression stream
    const decompressionStream = new DecompressionStream(format);

    // Create readable stream from compressed data
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(compressedData);
        controller.close();
      }
    });

    // Pipe through decompression stream
    const decompressedStream = readable.pipeThrough(decompressionStream);

    // Read the decompressed data
    const decompressedData = await new Response(decompressedStream).arrayBuffer();

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decompressedData);
  }
}
