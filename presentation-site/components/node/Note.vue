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
  v_text: {
    type: String,
    default: '',
  },
});
const idClass = `workflowid-${props.id}`;

</script>

<template>
  <label :data-workflowid="id" :class="[idClass]" class="pres-note">{{ v_text }}</label>
</template>
