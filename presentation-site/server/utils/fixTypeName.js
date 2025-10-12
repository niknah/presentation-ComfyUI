export default function (name) {
  return name.replace(/[^a-z0-9_]/gi, '');
}
