export default function (query, eventName, obj, rootElem) {
  if (isDevMode) {
    console.log('dispatchevent', arguments);
  }
  const rootElem2 = rootElem || document;
  const elems = rootElem2.querySelectorAll(query);
  if (elems.length === 0) {
    // console.log('no elements found: ', query, rootElem);
  }
  const msg = { detail: obj };
  for (const elem of elems) {
    const event = new CustomEvent(eventName, msg);
    elem.dispatchEvent(event);
  }
}
