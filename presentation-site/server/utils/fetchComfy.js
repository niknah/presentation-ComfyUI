import { Buffer } from 'node:buffer';
import process from 'node:process';

export default function (url, options) {
  const username = process.env.COMFYUI_USERNAME;
  const password = process.env.COMFYUI_PASSWORD;
  if (username && password) {
    if (!options) {
      options = {};
    }
    if (!options.headers) {
      options.headers = {};
    }
    const authStr = Buffer.from(`${username}:${password}`).toString('base64');
    options.headers.Authorization = `Basic ${authStr}`;
  }
  return fetch(url, options);
}
