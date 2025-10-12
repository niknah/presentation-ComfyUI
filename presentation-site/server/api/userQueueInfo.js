export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userFolder = getUserFolder(session);
  return {
    userFolder,
    queue: hasDB() ? (await updateUserPromptsDB(userFolder)) : [],
  };
});
