export default function (file, path) {
  const body = new FormData();
  body.append('image', file);
  body.append('subfolder', path);
  return fetch('/api/upload', {
    method: 'POST',
    body
  }).then((resp) => {
    if (!resp.ok) {
      // Alert
      console.error('Upload error', resp);
    }
    return resp.json();
  }).then((obj) => {
    return obj;
  });
}
