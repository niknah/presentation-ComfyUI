<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  options_value: {
    type: Array,
    default: () => [],
  },
  v_value: {
    type: String,
    default: '',
  },
})
const idClass = `workflowid-${props.id}`;
</script>

<template>
  <label class='pres-node-title'>{{ title }}</label><select data-valuename="value" :data-workflowid="id" :class="[idClass]" class="pres-input pres-select" :value="v_value">
    <option v-for="(option, index) in options_value" :key="index" :selected="`option == props.v_value`">{{ option }}</option>
  </select>
</template>
