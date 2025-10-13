export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    const query = getQuery(event);
    let q = new URLSearchParams(query);
    const userFolder = getUserFolder(session);
    if (userFolder) {
      q.set('email', userFolder);
    }
    let path = q.get('path');
    const pathM = /^([^/\\]+)[\/\\](.*)$/.exec(path);
    if (pathM) {
      q.set('path', pathM[1]);
      q.set('subfolder', pathM[2]);
    }

    function checkPath(q, name) {
      return !q.has(name) || isPathNameOk(q.get(name));
    }

    if(
      !checkPath(q, 'path') ||
      !checkPath(q, 'subfolder') ||
      !checkPath(q, 'email')
    ) {
      const pathMessage = 'Bad path name';
      throw createError({
        statusCode: 500,
        pathMessage,
        data: { ok: false, message: pathMessage  }
      });
    }

    const url = `${comfyPresentationUrl()}/files?${q.toString()}`;
    const resp = await fetchComfy(url);
    if (resp.status != 200) {
      const statusMessage = `Queue error: ${resp.status} ${resp.statusText}, ${await resp.text()}`;
      console.error('file error', statusMessage, url);
      throw createError({
        statusCode: 500,
        statusMessage,
        data: { ok: false, message: statusMessage  }
      });
    }

    return await resp.json();
  } catch (e) {
    console.error('wait crash', e);
    return { ok: false, message: e.toString()  };
  }
});
