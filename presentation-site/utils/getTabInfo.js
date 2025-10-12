export default function(tab) {
  let p = null;
  if (tab.matches('.pres-tab-container')) {
    p = tab;
  } else {
    p = tab.querySelector('.pres-tab-container');
  }
  if (!p) {
    console.error('Cannot find tab info', tab);
    return {};
  }
  const tabInfo = p; // .querySelector('.tab-info');
  const obj = {
    title: decodeURIComponent(tabInfo.getAttribute('data-title')),
    id: tabInfo.id,
  };
  for (const nv of tabInfo.attributes) {
    if (!obj[nv.name]) {
      const m = /^data-(.*)$/.exec(nv.name);
      if (m) {
        obj[m[1]] = nv.value;
      }
    }
  }
  return obj;
}

