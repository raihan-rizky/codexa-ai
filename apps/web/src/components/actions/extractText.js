export function extractText(node) {
  if (node == null) return "";

  // string / number
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  // array of nodes
  if (Array.isArray(node)) {
    let result = "";
    for (const child of node) {
      result += extractText(child);
    }
    return result;
  }

  // React element
  if (typeof node === "object" && node.props) {
    if ("props" in node && node.props?.children !== undefined) {
      return extractText(node.props.children);
    }
  }

  return "";
}
