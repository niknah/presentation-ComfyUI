<script setup>
//const props = defineProps({ })


const val = ref(0);
const max = ref(1);
const queue_remaining = ref(0);
const solidStyle = ref(`width: 0%`);
const showClass = ref('');

const progress = useTemplateRef('progress');
function progressEvent(evt) {
  const detail =  evt.detail;
  if (detail.queue_remaining !== undefined) {
    queue_remaining.value = detail.queue_remaining;
  }
  if (detail.loaded !== undefined) {
    val.value = detail.loaded;
    max.value = detail.total;
    solidStyle.value = `width: ${val.value/max.value*100}%;`;
  }
  showClass.value = (val.value > 0 || queue_remaining.value > 0) ? 'show' : '';
}

</script>

<template>
  <div ref="progress" :value="val" :max="max" :class="[showClass]" class="pres-event-progress-all pres-progress" @progress-all="progressEvent">
    <div class="pres-progress-text">
      <span v-if="queue_remaining > 0" class="pres-progress-queue">In Queue: {{ queue_remaining }}.</span>
      <span class="pres-progress-val">{{ val }} / {{ max }}</span>
    </div>
    <div class="pres-progress-solid" :style="solidStyle"></div>
  </div>
</template>

<style>
.pres-progress-solid {
  background-color: #ddddff;
  height: 100%;
}
.pres-progress-text {
  position: absolute;
  padding-left: 8px;
}
.pres-progress {
  display: none;
  width: 100%;
  height: 22px;
  border-radius: var(--border-ruler);
  border: 1px solid #444;
  overflow: hidden;
}
.pres-progress-queue {
  margin-right: 16px;
}
.pres-progress.show {
  display: block;
}
</style>
