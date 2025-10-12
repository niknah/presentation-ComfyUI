export default function (path) {
  if (!/^(?:output|input|models)(?:$|\/)/.exec(path)
    || /^\/|\.\./.exec(path)
  ) {
    return false;
  }
  return true;
}
