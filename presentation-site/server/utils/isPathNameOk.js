export default function(name) {
  return !/^\/|\.\./.exec(name);
}
