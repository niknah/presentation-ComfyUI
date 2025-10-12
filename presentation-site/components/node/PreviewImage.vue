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
  resizeToImage: {
    type: Boolean,
    default: true,
  },
  maxWidth: {
    type: Number,
    default: null,
  },
})

/*
const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
}
*/

const sliderContainer = useTemplateRef('slider-container')

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

function resizeImgs() {
  if (props.resizeToImage && glideRef.value) {
    // make all the images in the slider same size as the first one
    const imgs = glideRef.value.querySelectorAll('.pres-preview-image');
    const firstImg = imgs[0];
    if (firstImg) {
      const maxWidth = (props.maxWidth || (window.innerWidth/2));
      let width = firstImg.naturalWidth;
      let height = firstImg.naturalHeight;
      if (width > maxWidth) {
        width = maxWidth;
        const aspect = width / firstImg.naturalHeight;
        height = Math.floor(aspect * firstImg.naturalHeight);
      }
      for(const img of imgs) {
        img.style.width = `${width}px`;
        img.style.height = `${height}px`;
      }

      sliderContainer.value.style.width = `${width}px`;
      sliderContainer.value.style.height = `${height}px`;
    }
  }
}

let glide = null;
const glideRef = useTemplateRef("glideElem");
async function mountGlide() {
  if(glide) {
    glide.destroy();
  }

  resizeImgs();
  await nextTick(); // wait for everything to resize

  glide = new Glide(glideRef.value);
  glide.mount({ Controls, Breakpoints });
}

function loadimg() {
  mountGlide();
}

onMounted(() => {
  mountGlide();
  window.addEventListener('resize', resizeImgs);
});
onUnmounted(() => {
  window.removeEventListener('resize', resizeImgs);
});

</script>

<template>
  <div ref="slider-container" :data-workflowid="id" class="pres-preview-image-c" :class="[idClass, srcs.length <= 1 ? 'pres-no-prev-next': undefined]" @addsrc="addsrc" @clearsrcs="clearsrcs">
    <div ref="glideElem" class="glide">
      <div data-glide-el="track" class="glide__track">
        <ul class="glide__slides">
          <li v-for="(imgsrc, index) in srcs" :key="index">
            <img :src="imgsrc" class="pres-image pres-preview-image" @load="loadimg" />
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
/* @import url("vue3-carousel/carousel.css"); */

@import url("@glidejs/glide/dist/css/glide.core.min.css");
@import url("@glidejs/glide/dist/css/glide.theme.min.css");

.glide__slides li {
  flex-shrink: 0;
}

.pres-preview-image-c {
  /*
  max-width: 50vw;
  */
}

.pres-no-prev-next {
  /* & .carousel__prev, & .carousel__next, & .carousel__pagination { */
  & .glide__arrows {
    display: none;
  }
}
</style>
