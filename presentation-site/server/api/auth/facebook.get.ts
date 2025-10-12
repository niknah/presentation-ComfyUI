const config = useRuntimeConfig();
export default (hasFacebookAuth(config)) ? 
defineOAuthFacebookEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, { user, type: "facebook" })
    return sendRedirect(event, '/')
  }
})
: defineEventHandler(async (/* event */) => {});
