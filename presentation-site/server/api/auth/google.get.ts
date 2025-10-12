const config = useRuntimeConfig();
export default (hasGoogleAuth(config)) ?
defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, { user, type: "google" })
    return sendRedirect(event, '/')
  }
})
: defineEventHandler(async (/* event */) => {});;
