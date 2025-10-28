<script setup>

const props = defineProps(['historyItem']);
function clickParent(elem) {
  let p = elem.parentNode;
  while(p) {
    if (p.classList.has('pres-history-item')) {
      p.click();
      break;
    }
    p = elem.parentNode;
  }
}
</script>
<template>
  <div class='pres-history-media-toolbar'>
    <a class='pres-history-open' @click="clickParent(this)"></a>
    <a class='pres-history-download' target='_blank' :href='historyItem.outputs[0].viewURL + "&download=1"'></a>
  </div>
</template>
<style>

.pres-history-media-toolbar a {
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.pres-history-media-toolbar .pres-history-open {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 21C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5H20C20.5523 5 21 5.44772 21 6V9H19V7H11.5858L9.58579 5H4V16.998L5.5 11H22.5L20.1894 20.2425C20.0781 20.6877 19.6781 21 19.2192 21H3ZM19.9384 13H7.06155L5.56155 19H18.4384L19.9384 13Z'%3E%3C/path%3E%3C/svg%3E");
}

.pres-history-media-toolbar .pres-history-download {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M13 10H18L12 16L6 10H11V3H13V10ZM4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19Z'%3E%3C/path%3E%3C/svg%3E");
}

</style>
