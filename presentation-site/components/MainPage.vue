<script setup>

const mainContainer = useTemplateRef('tabs-main-container');
const tabs = ref([]);
const mounted = ref(false);
const openedTabName = ref('');

onMounted(async() => {
  const tabContainers = mainContainer.value.querySelectorAll('.pres-tab-container');
  const tabList = [];
  for (const tabContainer of tabContainers) {
    const tabInfo = tabContainer;
    tabList.push({
      title: decodeURIComponent(tabInfo.getAttribute('data-title')),
      classname: tabInfo.getAttribute('data-classname'),
      selected: false,
    });
  }
  tabs.value = tabList;
  mounted.value = true;

  await (new PresentationURL()).loadFromHash();
  if (tabList.length > 0) {
    if (openedTabName.value === '') {
      openTabName(tabList[0].classname);
    }
  }
  (new AddToQueue()).checkAllHistoryForComplete();
  return dispatchEvents('.pres-evant-page-mounted', 'page-mounted', {}, document);
});

function ctrlEnter(event) {
  if (event.ctrlKey && event.key === 'Enter') {
    window.submitTabInstance = new AddToQueue();
    window.submitTabInstance.submitTab(openedTab); //
  }
}

function dispatchOpenTab(tab, show) {
  tab.dispatchEvent(new CustomEvent('show-tab', {detail: {show} }));
  dispatchEvents('.pres-event-show-tab', 'show-tab', {show}, tab);
}

let openedTab = null;
function openTabName(name) {
  openedTabName.value = name;
  const tab = mainContainer.value.querySelector(`.pres-tab.pres-tabid-${name}`);
  if (tab) {
    if (openedTab) {
      // close previous tab
      dispatchOpenTab(openedTab, false);
      openedTab = null;
    }
    dispatchOpenTab(tab, true);
    openedTab = tab;
    return true;
  } else {
    console.error('Cannot find tab', name);
  }
  return false;
}

function openTab(evt) {
  const tabLink = evt.target;
  const name = tabLink.getAttribute('data-classname');

  openTabName(name);
}

function changeTab(evt) {
  openTabName(evt.detail?.tabName);
}

</script>

<template>
  <div class='pres-main-page' @keydown="ctrlEnter">
    <div class='pres-history-container'>
      <PresentationHistory />
    </div>
    <div ref="tabs-main-container" :data-opened-tab="openedTabName" class="pres-tabs-main-container" @change-tab="changeTab">
      <PresentationProgressAllTabs />
      <div v-if="mounted && tabs.length === 0">
        In ComfyUI.  <br />
        Add a group and put a Presentation Tab node into the group.<br />
        Save the tab and come back here.<br />
      </div>
      <ul class="pres-tab-bar">
        <a v-for="tab in tabs" :key="tab.classname" :class="[openedTabName === tab.classname ? 'current-tab' : '']" class="pres-tab-link" :data-classname="tab.classname" @click="openTab">{{ tab.title }}</a>
      </ul>
      <div class="pres-tabs-list">
        <Tablist />
      </div>
      <PresentationLogin />
      <PresentationShare />
    </div>
  </div>
</template>

<style>
ul.pres-tab-bar {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  padding-top: 20px;
}

.pres-tab-link {
  cursor: pointer;
}

.pres-tab-link {
  margin: 2px 4px;
  color: var(--font-color);
  border-radius: 10px 10px 0px 0px;
  text-align: center;
  box-shadow: inset 3px 3px 6px var(--color-shadow), inset -5px 5px 12px var(--color-white);
}

.pres-tab-link.current-tab {
  /* box-shadow: inset 1px 1px 2px var(--color-shadow), inset -2px 2px 6px var(--color-white); */
  /* text-shadow: 0px 0px 6px var(--font-color); */
  background-color: #fcfcfc;
}

.pres-history-container {
  float: left;
  display: inline-block;
  max-width: 25vw;
}
.pres-tabs-main-container {
  display: inline-block;
  max-width: 73vw;
}
</style>
