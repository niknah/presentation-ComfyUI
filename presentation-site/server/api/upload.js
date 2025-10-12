//import path from "node:path";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const formDatas = await readMultipartFormData(event);
  const formDataByName = {};
  for (const formData of formDatas) {
    formDataByName[formData.name] = formData;
  }

  const url = `${comfyUrl()}/upload/image`;
  // console.log('formData', formDataByName);
  const body = new FormData()

  body.append('image', new Blob([formDataByName.image.data]), formDataByName.image.filename)
  const subfolder = formDataByName.subfolder.data.toString();
  const userFolder = getUserFolder(session);

  if (!isPathNameOk(userFolder)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Invalid folder: ${userFolder}`,
    });
  }

  body.append('type', subfolder);
  body.append('subfolder', userFolder);
  const resp = await fetchComfy(url, {
    method: 'POST',
    body
  });

  if (resp.status != 200) {
    const statusMessage = `Queue error: ${resp.status} ${resp.statusText}, ${await resp.text()}`;
    console.error('Upload image error', statusMessage);
    throw createError({
      statusCode: 500,
      statusMessage,
      data: { ok: false, message: statusMessage  }
    });
  }

  const obj = await resp.json()
  obj.subfolder = subfolder;
  return obj;
});
