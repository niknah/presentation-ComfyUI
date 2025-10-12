<script setup>
const props = defineProps({
  id: {
    type: String,
    default: 'addqueue',
  },
  title: {
    type: String,
    default: '',
  },
  v_text: {
    type: String,
    default: "Add to Queue",
  },
})

const idClass = `workflowid-${props.id}`;
</script>

<template>
  <button :data-workflowid="id" class="pres-button pres-queue-start" :class="[idClass]">{{ v_text }}</button>
</template>
