export default function (elem) {
  for(const lazy of elem.querySelectorAll('.lazy')) {
    lazy.classList.remove('loaded');
    lazy.classList.remove('entered');
    lazy.removeAttribute('data-ll-status');
    lazy.removeAttribute('src');
  }
}
