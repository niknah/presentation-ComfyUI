<script setup>
import { toast } from 'vue3-toastify';
const props = defineProps({
  id: { type: String, required: true },
});

const tab = useTemplateRef('tab');
const show = ref(false);

async function submitTab(/* event */) {
  // const button = event.target;
  const addToQueue = new AddToQueue();
  try {
    await addToQueue.submitTab(tab.value);
  } finally {
    addToQueue.onUnmounted();
  }
}


onMounted(() => {
  for (const button of tab.value.querySelectorAll('.pres-queue-start')) {
    button.addEventListener('click', async (event) => {
      const sendingToast = toast.success('Sending to queue');
      await submitTab(event);
      toast.remove(sendingToast);
    });
  }
});

function showTab(event) {
  show.value = event.detail.show;
}

const idClass = `pres-tabid-${props.id}`;
</script>

<template>
  <div ref="tab" :class="[idClass, show ? 'pres-tab-show' : undefined]" class="pres-tab" @show-tab="showTab">
    <slot />
  </div>
</template>

<style>

.pres-tab {
  display: none;
}

.pres-tab.pres-tab-show {
  display: block;
}
</style>
