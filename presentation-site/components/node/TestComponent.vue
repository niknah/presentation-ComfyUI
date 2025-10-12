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
  v_data: {
    type: String,
    default: '',
  },
});

const idClass = `workflowid-${props.id}`;
</script>

<template>
  <div :data-workflowid="id" :class="[idClass]" class="test-component">
    <label class='pres-node-title'>{{ title }}</label>
    <pre>{{ v_data }}</pre>
  </div>
</template>
