import path from "node:path";
import sharp from 'sharp';

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userFolder = getUserFolder(session);

  const query = getQuery(event);
  const q = new URLSearchParams(query);
  if (userFolder) {
    let subfolder = q.get('subfolder') || '';
    subfolder = path.join(userFolder, subfolder);
    q.set('subfolder', subfolder);
  }
  const filename = q.get('filename');
  const dirName = path.dirname(filename);
  const baseFileName = path.basename(filename);

  if (dirName && dirName !== '.') {
    const subfolder = q.get('subfolder') || '';
    if (subfolder) {
      q.set('subfolder', path.join(subfolder, dirName));
      q.set('filename', baseFileName);
    } else {
      q.set('subfolder', dirName);
    }
  }

  if (
    !isPathNameOk(q.get('subfolder'))
    || !isPathNameOk(q.get('filename'))
    || !isPathNameOk(q.get('type'))
  ) {
    const statusMessage = `Bad path name: ${q.toString()}`;
    throw createError({
      statusCode: 500,
      statusMessage,
      data: { ok: false, message: statusMessage  }
    });
  }

  const url = `${comfyUrl()}/view?${q.toString()}`;
  const resp = await fetchComfy(url);
  if (resp.status !== 200) {
    const txt = await resp.text();
    const statusMessage = `View failed: ${resp.status} ${resp.statusText}, ${txt}`;
    console.error('error', statusMessage, txt, url);
    throw createError({
      statusCode: 500,
      statusMessage,
      data: { ok: false, message: statusMessage  }
    });
  }

  const blob = await resp.blob();
  if (!blob.size) {
    const statusMessage = `Blank image`;
    throw createError({
      statusCode: 500,
      statusMessage,
      data: { ok: false, message: statusMessage  }
    });
  }
  const width = parseInt(q.get('width'));
      
  if (width) {
    // set expires so we don't have to resize every time.
    setResponseHeaders(event, {
      'Expires': new Date(Date.now() +  24 * 60 * 60 * 1000).toUTCString(), // 1 day
    });
    return await sharp(await blob.arrayBuffer())
      .resize(width).webp().toBuffer();
  }
  return blob;
});
