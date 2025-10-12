export default defineEventHandler((event) => {
  try {
    const query = getQuery(event);
    const client_id = query.client_id;
    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    setResponseStatus(event, 200);
    event.node.res.flushHeaders();

    const send = (data) => {
      event.node.res.write(`event: message\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Initial connection
    send({ connected: true });

    // Clean up when client disconnects
    event.node.req.on('close', () => {
      console.log('close event stream');
      connectWSS(client_id, /* query.prompt_id, */ send);
    });

    const comfy_wss = comfyUrl().replace(/^http(s?):/, (_m, s) => {
      return `ws${s}:`;
    });

    function connectWSS(client_id, /* prompt_id, */ send) {
      const wssUrl = `${comfy_wss}/ws?clientId=${client_id}`
      const socket = new WebSocket(wssUrl);
      // Event: Connection opened
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established.');
      });
      // Event: Message received
      socket.addEventListener('message', async (event) => {
        if (event.data instanceof Blob) {
          const int8Array = new Uint8Array(await event.data.arrayBuffer());
          send({
            type: 'blob', 
            blob: CompressString.uint8ArrayToBase64Reduce(int8Array),
          });
          return;
        }
        const obj = JSON.parse(event.data);
        if (isDevMode) {
          console.log('message',obj.type);
        }
        send(obj);
      });

      // Event: Error occurred
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Event: Connection closed
      socket.addEventListener('close', (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        // event.node.res.end();
      });
    }

    connectWSS(client_id, /* query.prompt_id, */ send);

    event._handled = true;
  } catch (e) {
    console.error('wait crash', e);
  }
});
