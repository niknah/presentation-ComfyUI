<script setup>

const currentHash = ref(null);
const currentTabHash = ref(null);
const executedHash = ref(null);
const show = ref(false);

async function click() {
  const prefix = location.protocol + "//" + location.host + location.pathname;
  currentHash.value = prefix + (await new PresentationURL().getCurrentHash());
  executedHash.value = prefix + location.hash;
  // const executedParams = new URLSearchParams(location.hash.substring(1));
  const tab = getCurrentTab();
  if (tab) {
    const tabInfo = getTabInfo(tab);
    currentTabHash.value = prefix + (await new PresentationURL().getCurrentTabHash(tab, tabInfo.classname));
  } else {
    currentHash.value = null;
  }
  show.value = show.value ? false : true;
}

async function copy(event) {
  const prev = event.target.previousElementSibling;
  await navigator.clipboard.writeText(prev.value);
  toast.success('Copied');
}

</script>

<template>
  <button class="pres-button" @click="click"><div class="pres-share-icon"></div></button>
  <table v-show="show" class="pres-share-container pres-dialog">
    <tbody>
      <tr v-if="currentHash"><td>Share all tabs</td><td>
        <input type="text" :value="currentHash" />
        <button class="pres-button" @click="copy"><span class="pres-copy-icon"></span></button>
      </td></tr>
      <tr v-if="executedHash"><td >Last executed with output</td><td>
        <input type="text" :value="executedHash" title="Same as the URL" />
        <button class="pres-button" @click="copy"><span class="pres-copy-icon"></span></button>
      </td></tr>
      <tr v-if="currentTabHash"><td>Only this tab</td><td>
        <input type="text" :value="currentTabHash" />
        <button class="pres-button" @click="copy"><span class="pres-copy-icon"></span></button>
      </td></tr>
    </tbody>
  </table>
</template>

<style>

.pres-share-container {
  margin: auto;
  width: fit-content;
  & table {
    width: 100%;
  }
  & td {
    padding: 0px 14px;
  }
  & input {
    width: 320px;
  }
}

.pres-copy-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M7 4V2H17V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7ZM7 6H5V20H19V6H17V8H7V6ZM9 4V6H15V4H9Z'%3E%3C/path%3E%3C/svg%3E");
}

.pres-share-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M10 3V5H5V19H19V14H21V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H10ZM17.5858 5H13V3H21V11H19V6.41421L12 13.4142L10.5858 12L17.5858 5Z'%3E%3C/path%3E%3C/svg%3E");
}

</style>
