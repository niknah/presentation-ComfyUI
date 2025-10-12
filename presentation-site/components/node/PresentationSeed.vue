<script setup>
defineOptions({ inheritAttrs: false });
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  v_value: {
    type: Number,
    default: -1,
  },
  v_after_generate: {
    type: String,
    default: 'random',
  },
  options_after_generate: {
    type: Array,
    default: () => ['increase', 'decrease', 'random', 'fixed'],
  }
});
const value = ref(props.v_value);
const idClass = `workflowid-${props.id}`;

const after_generate = useTemplateRef('after_generate');

function next_value() {
  const v = after_generate.value.value;
  if (v === 'increase') {
    ++value.value;
  } else if (v === 'decrease') {
    --value.value;
  } else if (v === 'random') {
    value.value = Math.floor(Math.random() * 1000000000000);
  } else if (v !== 'fixed') {
    console.warn('Unknown after_generate', v);
  }
}

function postSubmit() {
  next_value();
}

onMounted(() => {
  after_generate.value.value = props.v_after_generate;
});
</script>

<template>
  <div>
    <label class='pres-node-title'>{{ title }}</label><input v-model="value" type="number" :data-workflowid="id" :class="[idClass]" class="pres-input" data-valuename="value" />
    <select ref="after_generate" :data-workflowid="id" data-valuename="after_generate" class="pres-select pres-seed-after-generate pres-input pres-event-post-submit" @post-submit="postSubmit">
      <option v-for="(gen_name, index) in options_after_generate" :key="index">{{ gen_name }}</option>
    </select>
  </div>
</template>
