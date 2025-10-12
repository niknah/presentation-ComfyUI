<script setup>
import LazyLoad from "vanilla-lazyload";
import YesNoDialog from './YesNoDialog.vue';

const historyList = ref([]);
const listElem = useTemplateRef('listElem');
const confirmDialog = useTemplateRef('confirmDialog');

let lazyLoadInstance;

function getHistoryItem(tab, prompt_id) {
  const outputs = [];
  for (const nodeId in tab) {
    const node = tab[nodeId];
    for (const outputType in node) {
      const output = node[outputType];
      for (const o of output) {
        if (typeof(o) === 'object') {
          o.prompt_id = prompt_id;
          o.viewURL = getViewURL(o);
          outputs.push(o);
        }
      }
    }
  }
  return outputs;
  // {"11":{"images":[{"filename":"ComfyUI_temp_mynbi_00010_.png","subfolder":"","type":"temp"}]}}
}

async function loadHistoryList(history) {
  historyList.value.length = 0;
  const list = [];
  for (const obj of history) {
    const params = new URLSearchParams(obj.text.substring(1));
    const tabName = params.get('t');
    const o = params.get('o');
    let outputs = [];
    if (o) {
      try {
        const tabs = await CompressString.base64ToObj(o);
        outputs = getHistoryItem(tabs[tabName].outputs, obj.id);
      } catch(e) {
        console.error(
          'history: decompress outputs error, prompt_id:',
          obj.id, o, obj, e
          );
      }
    }
    list.push({
      outputs,
      hash: obj.text,
    });
  }
  historyList.value = list;

  await nextTick();
  const width=listElem.value.querySelector('.lazy')?.width;
  historyList.value.forEach((hList) => {
    hList.outputs.forEach((h) => {
      if (width) {
        h.previewURL = `${h.viewURL}&width=${width}`;
      } else {
        h.previewURL = h.viewURL;
      }
    });
  });
}

async function updateHistory() {
  const history = await HistoryDB.getDB().getAllEntries();
  history.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
  await loadHistoryList(history);

//  resetLazyLoad(listElem.value);
//  lazyLoadInstance.update();
}

function clickItem(item) {
  location.href = item.hash;
  new PresentationURL().loadFromHash(item.hash.substring(1));
}

async function clearHistory() {
    const yes = await confirmDialog.value.show();
    if (yes) {
      await HistoryDB.getDB().clear();
      updateHistory();
    }
}


onMounted(async () => {
  updateHistory();
  lazyLoadInstance = new LazyLoad({ });
  lazyLoadInstance.update();
});
</script>

<template>
  <div v-show="historyList.length > 0" >
    <div class='pres-history-header'>
      <h3>History</h3><a class='pres-history-clear' @click='clearHistory'></a>
      <YesNoDialog ref="confirmDialog" message="Do you really want to clear the history?" />
    </div>
    <div ref="listElem" class="pres-history-list pres-event-update-history" @update-history="updateHistory">
      <div v-for="historyItem in historyList" :key="historyItem.id" :data-hash="historyItem.hash" class="pres-history-item" @click="clickItem(historyItem)">
        <div v-if="historyItem.outputs.length > 0" class="pres-history-preview">
          <span v-if="historyItem.outputs.length > 1" class="pres-history-count">{{ historyItem.outputs.length }}</span>
          <img v-if="/\.(png|gif|avif|webp|jpg|jpeg|bmp|ico)$/i.exec(historyItem.outputs[0].filename)" class="pres-history-media pres-history-image lazy" :src="historyItem.outputs[0].previewURL" />
          <div v-else-if="/\.(mp4|avi|webm|mkv|mov|wmv)$/i.exec(historyItem.outputs[0].filename)" class='pres-history-media-wrapper'>
            <div class='pres-history-media-toolbar'><a @click="clickItem(historyItem)"></a></div>
            <video class="pres-history-media pres-history-video" :src="historyItem.outputs[0].viewURL" controls ></video>
          </div>
          <div v-else-if="/\.(mp3|wav|flac|ogg|aac|wma|aiff|m4a)$/i.exec(historyItem.outputs[0].filename)" class='pres-history-media-wrapper'>
            <div class='pres-history-media-toolbar'><a @click="clickItem(historyItem)"></a></div>
            <audio  class="pres-history-media pres-history-audio" :src="historyItem.outputs[0].viewURL" controls></audio>
          </div>
          <a v-else :src="historyItem.outputs[0].viewURL">Download</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.pres-history-list {
  & h3 {
    text-align: center;
  }
  padding: 2px;
  box-shadow: 10px 0 10px -10px;
  margin-right: 8px;
  height: 100vh;
  display: block;
  overflow: scroll;
}

.pres-history-count {
  position: absolute;
  margin-left: 6px;
}

.pres-history-preview {
  overflow: hidden;
  border-radius: var(--border-ruler);
  border: 1px solid #888;
  margin: 2px;
}

.pres-history-preview .pres-history-media
{
  width: 24vw;
}

.pres-history-preview .pres-history-image,
{
  min-height: 24vw;
}

.pres-history-item {
  width: fit-content;
}

.pres-history-header {
  display: flex;
  & h3 {
    width: 100%;
    text-align: center;
  }
}
.pres-history-clear {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(96,96,96,1)'%3E%3Cpath d='M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM9 11V17H11V11H9ZM13 11V17H15V11H13ZM9 4V6H15V4H9Z'%3E%3C/path%3E%3C/svg%3E");
  height: 24px;
  width: 24px;
  display: inline-block;
  margin: auto 4px;
  cursor: pointer;
}

.pres-history-container.horizontal {
  float: none;
  display: 100%;

  & .pres-history-item {
    display: inline-block;
  }
}
.pres-history-media-toolbar a {
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 21C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5H20C20.5523 5 21 5.44772 21 6V9H19V7H11.5858L9.58579 5H4V16.998L5.5 11H22.5L20.1894 20.2425C20.0781 20.6877 19.6781 21 19.2192 21H3ZM19.9384 13H7.06155L5.56155 19H18.4384L19.9384 13Z'%3E%3C/path%3E%3C/svg%3E");
}

</style>
