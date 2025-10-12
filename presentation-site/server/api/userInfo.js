export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    const userFolder = getUserFolder(session);
    if (hasDB()) {
      const userInfo = await (new UsersDB()).getUser(userFolder);
      if (userInfo) {
        return userInfo;
      }
    }
    return {};
  } catch (e) {
    console.error('userInfo crash', e);
  }
});
  
