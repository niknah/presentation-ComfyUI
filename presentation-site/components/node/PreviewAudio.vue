<script setup>
// import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'
import Glide, { Controls, Breakpoints } from '@glidejs/glide/dist/glide.modular.esm'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
})


const srcs = ref([]);

const idClass = `workflowid-${props.id}`;

function addsrc(event) {
  if (event.detail.src) {
    srcs.value.push(event.detail.src);
  } else if (event.detail.done) {
    mountGlide();
  }
}

function clearsrcs() {
  srcs.value.length = 0;
}

let glide = null;
const glideRef = useTemplateRef("glideElem");
async function mountGlide() {
  if(glide) {
    glide.destroy();
  }
  await nextTick(); // wait for everything to resize

  glide = new Glide(glideRef.value);
  glide.mount({ Controls, Breakpoints });
}
</script>

<template>
  <div :data-workflowid="id" class="pres-preview-audio-c" :class="[idClass, srcs.length <= 1 ? 'pres-no-prev-next': undefined]" @addsrc="addsrc" @clearsrcs="clearsrcs">
    <div ref="glideElem" class="glide">
      <div data-glide-el="track" class="glide__track">
        <ul class="glide__slides">
          <li v-for="(imgsrc, index) in srcs" :key="index">
            <audio controls class="pres-audio pres-preview-audio" :src="imgsrc"></audio>
          </li>
        </ul>
      </div>
      <div class="glide__arrows" data-glide-el="controls">
        <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
        <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
      </div>
    </div>
  </div>
</template>

<style>
@import url("@glidejs/glide/dist/css/glide.core.min.css");
@import url("@glidejs/glide/dist/css/glide.theme.min.css");

.pres-preview-audio-c {
  width: 320px;
}
.pres-preview-audio-c audio {
  width: 240px;
}

.pres-no-prev-next {
  & .glide__arrows {
    display: none;
  }
}
</style>
