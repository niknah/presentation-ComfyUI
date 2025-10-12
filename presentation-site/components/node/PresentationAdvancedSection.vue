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
  v_name: {
    type: String,
    default: 'Advanced',
  },
  v_section_end: {
    type: Boolean,
    default: false,
  },
  v_shown: {
    type: Boolean,
    default: false,
  },
});
const idClasses = [`workflowid-${props.id}`];
if (props.v_section_end) {
  idClasses.push('pres-advanced-section-end');
}

const link = useTemplateRef("link");
const shown = ref(props.v_shown);

function click() {
  show(link.value, !shown.value);
}

function show(link, show) {
  shown.value = show;
  let p = link.parentNode;
  let container = null;
  while (p) {
    if (p.tagName === "TR" || p.tagName === "SECTION") {
      container = p;
      break;
    }
    p = p.parentNode;
  }
  if (container) {
    let row = container.nextElementSibling;
    while (row) {
      if (row.querySelector('.pres-advanced-section')) {
        break;
      }

      if (show) {
        row.classList.remove("pres-advanced-section-hidden");
      } else {
        row.classList.add("pres-advanced-section-hidden");
      }
      row = row.nextElementSibling;
    }
  } else {
    console.error('No container found for AdvancedSection', link);
  }
}

watch(shown, () => {
  show(link.value, shown.value);
});

function change(event) {
  shown.value = event.target.checked;
}

function pageMounted() {
  show(link.value, shown.value);
}
</script>

<template>
  <div :data-workflowid="id">
    <input type='checkbox' :checked="shown" data-valuename="shown" :data-workflowid="id" class="pres-advanced-section-shown pres-input" @change="change" />
    <a ref="link" :class="idClasses" class="pres-advanced-section pres-event-page-mounted" @page-mounted="pageMounted" @click="click">{{ v_name }}</a>
  </div>
</template>

<style>
.pres-advanced-section {
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: color-mix(in hsl, var(--font-color), black 50%);
  }
}

body .pres-advanced-section-hidden {
  display: none;
}

.pres-advanced-section-shown,
.pres-advanced-section-end  {
  display: none;
}
</style>
