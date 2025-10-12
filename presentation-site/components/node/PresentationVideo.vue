<script setup>
/* eslint-disable vue/no-v-html */
const props = defineProps({
  v_value: {
    type: String,
    default: '',
  },
  v_path: {
    type: String,
    default: 'input',
  },
})

const videoText = ref('&#x1F4F9;');
const fileName = ref(props.v_value.value);
const lastBlobURL = ref(null);
const lastBlobFileName = ref(null);
const presPreview = useTemplateRef("presPreview");
const dropDown = true;

let presentationVideo = null;
function video() {
  if (!presentationVideo) {
    presentationVideo = new PresentationVideo();
    return presentationVideo.startRecording().then((success) => {
      if (success) {
        videoText.value = '&#x25A0;';
      } else {
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
    });
  } else {
    // Wait for conversion to complete
    const stop = async () => {
      const blob = presentationVideo.createVideoBlob();
      if (blob) {
        const dateStr = getIsoDateFileName();
        fileName.value = `video-${dateStr}.webm`;
        const file = new File([blob], fileName.value);
        await uploadFile(file, props.v_path);
        dispatchLoadFiles();
        lastBlobURL.value = presentationVideo.getBlobURL();
        presentationVideo = null;
      }
    };
    presentationVideo.events.addEventListener('stop', stop);
    onUnmounted(() =>
      presentationVideo.events.removeEventListener('stop', stop)
    );

    const success = presentationVideo.stopRecording();
    if (success) {
      videoText.value = '&#x1F4F9;';
    }
  }
}

function changePreview(event) {
  if (dropDown) {
    lastBlobURL.value = event.detail.url;
    lastBlobFileName.value = event.detail.filename;
  }
}

</script>

<template>
  <NodePresentationFile :v_value = "fileName" :v_path="v_path" :drop-down="dropDown" type-class="pres-video-container">
    <template #buttons>
      <button ref="presPreview" class="pres-event-change-preview pres-button" @click="video" @change-preview="changePreview" v-html="videoText"></button>
      <video v-if="lastBlobURL" class="pres-video pres-preview" controls :src="lastBlobURL"></video>
    </template>

    <template v-if="!dropDown" #item="{ option, index }">
      <video :key="index" class="pres-video-item" controls :src="option.url" :title="option.file" ></video>
    </template>
  </NodePresentationFile>
</template>


<style>
.pres-video-item {
  width: 100%;
}
.pres-video-container .pres-selected {
  border: 2px solid #444;
  border-radius: 5%;
}
</style>
