<script setup>
/* eslint-disable vue/no-v-html */
import { marked } from "marked";

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

const html = marked.parse(props.v_text);

</script>

<template>
  <label :data-workflowid="id" :class="[idClass]" class="pres-markdown-note" v-html="html"></label>
</template>
