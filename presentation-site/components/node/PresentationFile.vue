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
  dropDown: {
    type: Boolean,
    default: true,
  },
  typeClass: {
    type: String,
    default: undefined,
  },
  v_path: {
    type: String,
    default: 'input',
  },
  v_regex: {
    type: String,
    default: '.',
  },
  v_value: {
    type: String,
    default: null,
  },
  v_defaultoptions: {
    type: Array,
    default: function() { return []; },
  },
})
const idClass = `workflowid-${props.id}`;
const selectClasses = [idClass];

const options = ref(props.v_defaultoptions);
const selectElem = useTemplateRef("selectElem");
const filterElem = useTemplateRef("filterElem");
const presentationFileElem = useTemplateRef("presentation-file");
let firstloadDone = false;

if (!props.dropDown) {
  selectClasses.push('pres-hide-dropdown');
}

async function upload(event) {
  const files = event.target.files || event.dataTransfer.files || event.clipboardData.files;
  if (!files.length) {
    console.warn('No files in event', event);
  }

  for (const file of files) {
    await uploadFile(file, props.v_path);
  }
  dispatchLoadFiles();
}

function loadFiles() {
  let loadedValue = null;

  if (selectElem.value.options.length > 0) {
    // options already loaded, user may have selected something
    loadedValue = selectElem.value.value;
    if (!loadedValue) {
      loadedValue = props.v_value;
    }
  }

  if (typeof window !== 'undefined') {
    // TODO cache list
    const url = `/api/files?path=${encodeURIComponent(props.v_path)}&regex=${encodeURIComponent(props.v_regex)}`;
    return fetch(
      url
    ).then((resp) => {
      return resp.json();
    }).then(async (obj) => {
      if (!obj.files) {
        console.error('no files: ', props.v_path, props.v_regex, obj);
        return;
      }

      const files = obj.files.sort((a, b) => {
        return b.mtime - a.mtime;
      });
      obj.files.forEach(i => {
        i.url = getViewURL({filename:i.file, subfolder:"", type:props.v_path});
      });

      await setFilesList(files);
          
      if (loadedValue === null) {
        // nothing selected
        loadedValue = selectElem.value.getAttribute('data-loadedvalue');
      }
      selectElem.value.value = loadedValue;
    });
  }
}

function change(event) {
  dispatchEvents(
    '.pres-event-change-preview',
    'change-preview',
    {
      detail: { 
        url: (event.target.value ?
          getViewURL({
            filename:event.target.value,
            subfolder:"",
            type:props.v_path
          })
          : null),
        filename: event.target.value
      } 
    },
    presentationFileElem.value,
  );
}

function filterChange() {
  return setFilesList(unfilteredFilesList);
}

let unfilteredFilesList = [];
async function setFilesList(files) {
  unfilteredFilesList = files;
  const filterValue = filterElem?.value?.value?.trim();
  if (filterValue.length === 0) {
    options.value = files;
  } else {
    const re = new RegExp(filterValue, 'i');

    options.value = files.filter(
      i => { return re.exec(i.file) ? true : false; }
    );
  }
}

let currentSelectedItem = null;
function selectItem(event) {
  let target = event.target;
  while (target && target.tagName !== 'BODY') {
    const file = target.getAttribute('data-file');
    if (file !== null) {
      selectElem.value.value = file;
      if (currentSelectedItem) {
        currentSelectedItem.classList.remove('pres-selected');
      }
      currentSelectedItem = target;
      currentSelectedItem.classList.add('pres-selected');
      break;
    }
    target = target.parentNode;
  }
}

onMounted(() =>{
  watch(options, async () => {
    if(presentationFileElem.value) {
      await nextTick(); // wait for the list of files to change in the ui
      dispatchEvents(
        '.pres-event-change-files', 'change-files',
        {files: options.value}, presentationFileElem.value
      );
    }
  });
});

async function showTab(show) {
  // let's not load the files until someone clicks on the tab.
  if (show && !firstloadDone) {
    await loadFiles();
    firstloadDone = true;
  }
}


</script>
<template>
  <div ref='presentation-file' class='presentation-file pres-event-show-tab' :class="[idClass, props.typeClass]" @show-tab='showTab'>
    <label class='pres-node-title'>{{ title }}</label>
    <input ref="filterElem" placeholder="filter" @input="filterChange" />
    <a class='pres-load-files-icon' @click="loadFiles"></a>
    <select ref="selectElem" :data-workflowid="id" class="pres-select pres-input pres-load-files" data-valuename="value" size="4" :class="selectClasses" @pres-load-files="loadFiles" @change="change">
      <option value=""></option>
      <option v-for="(option, index) in options" :key="index">{{ option.file }}</option>
    </select>
    <div v-if="$slots.item && options?.length > 0" class='pres-file-item-list'>
      <span v-for="(option, index) in options" :key="index" :data-file="option.file" class="pres-file-item" @click="selectItem">
        <slot name="item" :option="option" :index="index"></slot>
      </span>
    </div>
    <div class="pres-record-buttons">
      <input type="file" class="pres-upload" @change="upload" />
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<style>
.pres-file-item-list {
  width: 100%;
  height: 50vh;
  overflow: scroll;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.pres-file-item {
  display: inline-block;
  min-width: 24%;
  width: 24%;
  margin: 4px;
  vertical-align: middle;
}

.pres-button {
  font-size: 20px;
}

.pres-hide-dropdown {
  display: none;
}

.pres-load-files {
  display: block;
}

.pres-node-title {
  padding-right: 20px;
}

.pres-load-files-icon {
  cursor: pointer;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M5.46257 4.43262C7.21556 2.91688 9.5007 2 12 2C17.5228 2 22 6.47715 22 12C22 14.1361 21.3302 16.1158 20.1892 17.7406L17 12H20C20 7.58172 16.4183 4 12 4C9.84982 4 7.89777 4.84827 6.46023 6.22842L5.46257 4.43262ZM18.5374 19.5674C16.7844 21.0831 14.4993 22 12 22C6.47715 22 2 17.5228 2 12C2 9.86386 2.66979 7.88416 3.8108 6.25944L7 12H4C4 16.4183 7.58172 20 12 20C14.1502 20 16.1022 19.1517 17.5398 17.7716L18.5374 19.5674Z'%3E%3C/path%3E%3C/svg%3E");
}

</style>
