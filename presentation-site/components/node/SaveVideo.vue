<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
})
const srcs = ref([]);
const idClass = `workflowid-${props.id}`;

function addsrc(event) {
  if (event.detail.src) {
    const url = new URL(event.detail.src, location.href);
    srcs.value.push({url, filename: url.searchParams?.get("filename")});
  }
}

function clearsrcs() {
  srcs.value.length = 0;
}
</script>

<template>
  <div :data-workflowid="id" class="preview-video-c" :class="[idClass]" @addsrc="addsrc" @clearsrcs="clearsrcs">
    <div v-if="srcs.length > 0" class="pres-video-list">
      <label class='pres-node-title'>{{ title }}</label>
      b
      <template v-for="(videosrc, index) in srcs" :key="index" >
        <img v-if="/\.gif$/.exec(videosrc.filename)" class="rounded-lg" :src="videosrc.url">
        <video v-else controls class="rounded-lg" :src="videosrc.url"></video>
      </template>
    </div>
  </div>
</template>

<style>
.preview-video-c label {
  display: block;
}
</style>
