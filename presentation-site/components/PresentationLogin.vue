<script setup>
const { loggedIn, user, clear /*, session, fetch, clear, openInPopup */ } = await useUserSession()

// const hasGoogleAuth2 = hasGoogleAuth;
const config = useRuntimeConfig();

</script>

<template>
  <div class='pres-login'>
    <div v-if="loggedIn">
      Hi {{ user.name }},
      <button class="pres-button" @click="clear">Logout</button>
    </div>
    <div v-else>
      Login with 
      <a v-if="hasGoogleAuth(config)" href="/api/auth/google">Google</a>
      | <a v-if="hasFacebookAuth(config)" href="/api/auth/facebook">Facebook</a>
    </div>
  </div>
</template>

<style>
.pres-login {
  display: inline-block;
}
</style>
