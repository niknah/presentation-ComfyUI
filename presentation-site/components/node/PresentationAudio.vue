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

const audioText = ref('&#127908;');
const fileName = ref(props.v_value.value);
const lastBlobURL = ref(null);
const lastBlobFileName = ref(null);
const dropDown = true;

let presentationAudio = null;
function audio() {
  if (!presentationAudio) {
    presentationAudio = new PresentationAudio();
    return presentationAudio.startRecording().then((success) => {
      if (success) {
        audioText.value = '&#x25A0;';
      } else {
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
    });
  } else {
    // Wait for conversion to complete
    const stop = () => {
      return presentationAudio.createAudioBlob().then(async () => {
        const buffer = presentationAudio.getWAVBuffer();
        if (buffer) {
          const blob = new Blob([buffer], { type: 'audio/wav' });
          const dateStr = getIsoDateFileName();
          fileName.value = `recording-${dateStr}.wav`;
          const file = new File([blob], fileName.value);
          await uploadFile(file, props.v_path);
          dispatchLoadFiles();
          lastBlobURL.value = presentationAudio.getBlobURL();
          presentationAudio = null;
        }
      });
    };
    presentationAudio.events.addEventListener('stop', stop);
    onUnmounted(() => 
      presentationAudio.events.removeEventListener('stop', stop)
    );

    const success = presentationAudio.stopRecording();
    if (success) {
      audioText.value = '&#127908;';
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
  <NodePresentationFile :v_value = "fileName" :v_path="v_path" :drop-down="dropDown" type-class="pres-audio-container">
    <template #buttons>
      <button class="pres-event-change-preview pres-button" @click="audio" @change-preview="changePreview" v-html="audioText"></button>
      <audio v-if="lastBlobURL" controls :src="lastBlobURL"></audio>
    </template>

    <template v-if="!dropDown" #item="{ option, index }">
      <span :key="index">{{ option.file }}</span>
      <!--
      <audio :key="index" class="pres-audio-item" controls :src="option.url"></audio>
      -->
    </template>
  </NodePresentationFile>
</template>

<style>
.pres-audio-container .pres-item {
  width: 100%;
  overflow-wrap: anywhere;
}
.pres-audio-container .pres-selected {
  border: 2px solid #444;
  border-radius: 5%;
}
</style>
