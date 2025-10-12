export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    const userFolder = getUserFolder(session);
    if (hasDB()) {
      const userLog = await (new UsersDB()).getPaymentLog(userFolder);
      if (userLog) {
        return userLog;
      }
    }
    return [];
  } catch (e) {
    console.error('userHistory crash', e);
  }
});
  
