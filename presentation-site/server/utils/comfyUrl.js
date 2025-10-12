import process from 'node:process';

const theComfyUrl = (process.env.COMFYUI_URL || 'http://localhost:8188')
  .replace(/\/+$/,''); 

export default function() {
  return theComfyUrl;
}
