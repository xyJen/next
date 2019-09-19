const nodeMap = new Map();

function createElement(nodeName, attrs = {}, children = []) {
  const Element = nodeMap.get(nodeName);
  if(!Element) throw new TypeError(`Invalid node: ${nodeName}`);
  const elem = new Element(attrs);
  children.forEach((child) => {
    elem.appendChild(child);
  });
  return elem;
}

const ownerDocument = {
  registerNode(Node, nodeName, nodeType = 100) {
    if(nodeMap.has(nodeName)) throw new TypeError(`Cannot registerNode, ${nodeName} has been taken.`);
    nodeMap.set(nodeName, Node);
    Object.defineProperties(Node.prototype, {
      nodeType: {
        value: nodeType,
      },
      tagName: {
        value: nodeName.toUpperCase(),
      },
      nodeName: {
        value: nodeName.toLowerCase(),
      },
      ownerDocument: {
        value: ownerDocument,
      },
      namespaceURI: {
        value: `http://spritejs.org/${nodeName}`,
      },
    });
  },
  createElement,
  createElementNS(uri, name) {
    return createElement(name);
  },
  isSpriteNode(nodeName) {
    return nodeMap.has(nodeName);
  },
};

export default ownerDocument;