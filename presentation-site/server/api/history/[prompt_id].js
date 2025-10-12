export default defineEventHandler(async (event) => {
  const prompt_id = event.context.params.prompt_id;
  const query = getQuery(event);
  const q = new URLSearchParams(query);

  const session = await getUserSession(event);
  const userFolder = getUserFolder(session);
  if (userFolder) {
    q.set('subfolder', userFolder);
  }

  let price = 0;
  if (hasDB()) {
    const { promptIds } = await updateUserPromptsDB(userFolder);
    const promptInfo = promptIds[prompt_id];
    if (!promptInfo) {
      console.log('could not find prompt', prompt_id, promptIds);
      return { ok: false, message: `Could not find prompt ${prompt_id}` };   
    }
    price = promptInfo.price;
  }

  const url = `${comfyPresentationUrl()}/history_move/${prompt_id}?${q}`;
  return fetchComfy(url, {
    method: 'GET',
  }).then(async (resp) => {
    if (resp.status !== 200) {
      const statusMessage = `History failed: ${resp.status} ${resp.statusText}, ${await resp.text()}`;
      throw createError({
        statusCode: 500,
        statusMessage,
        data: { ok: false, message: statusMessage  }
      });
    }

    return resp;
  }).then(resp => resp.json())
  .then(async (res) => {
    if (res.ok && res.moved > 0) {
      if (hasDB()) {
        if (price) {
          await (new UsersDB()).takePaymentAmount(userFolder, price, prompt_id);
        }
      }
    }
    return res.history;
  });
})
