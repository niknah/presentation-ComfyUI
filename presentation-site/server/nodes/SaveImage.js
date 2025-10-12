export function processApiNode(node) {
  const filename_prefix = node?.inputs?.filename_prefix;
  if (filename_prefix) {
    if (!isPathNameOk(filename_prefix)) {
      throw new Error('Save. Security problem: ', filename_prefix);
    }
  }
}
