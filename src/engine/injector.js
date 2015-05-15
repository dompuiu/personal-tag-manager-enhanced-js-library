var AT_START = 1;
var AT_END = 2;
var HEAD = 1;
var BODY = 2;

/**
 * The HtmlInjector takes care to append to the DOM the nodes it receives.
 */
var Injector = {
  /**
   * Finding the parent node. Inserting the provided node at
   * a specified position.
   *
   * @param HTMLELement The node that must be injected in the page.
   * @param number      The parent node id (1 = HEAD, 2 = BODY).
   * @param number      The position id (1 = START, 2 = END).
   *
   * @return boolean
   */
  inject: function (node, parentNodeTag, position) {
    var parentNode;

    position = parseInt(position, 10);

    parentNodeTag = parseInt(parentNodeTag, 10);
    if (!parentNodeTag) {
      parentNodeTag = BODY;
    }

    parentNode = this.getParentNode(parentNodeTag);

    return this.doInjection(node, parentNode, position);
  },


  /**
   * Finding the parent node. Inserting the provided node at
   * a specified position.
   *
   * @param HTMLELement The node that must be injected in the page.
   * @param HTMLELement The parent node.
   * @param number      The position id (1 = START, 2 = END).
   *
   * @return boolean
   */
  doInjection: function (node, parentNode, position) {
    if (!node || !parentNode) {
      return false;
    }

    if (!position) {
      position = AT_END;
    }

    if (position === AT_START) {
      return this.injectAtStart(node, parentNode);
    } else if (position === AT_END) {
      return this.injectAtEnd(node, parentNode);
    }

    return false;
  },


  /**
   * Inserting the node at the start of the parent node.
   *
   * @param HTMLELement The node that must be injected in the page.
   * @param HTMLELement The parent node.
   *
   * @return boolean
   */
  injectAtStart: function (node, parentNode) {
    if (parentNode.childNodes.length === 0) {
      return this.injectAtEnd(node, parentNode);
    }

    parentNode.insertBefore(node, parentNode.childNodes[0]);
    return true;
  },


  /**
   * Inserting the node at the end of the parent node.
   *
   * @param HTMLELement The node that must be injected in the page.
   * @param HTMLELement The parent node.
   *
   * @return boolean
   */
  injectAtEnd: function (node, parentNode) {
    parentNode.appendChild(node);
    return true;
  },


  /**
   * Get the parent node for the provided ID.
   *
   * @param number The parent node ID.
   *
   * @return boolean|HTMLELement
   */
  getParentNode: function (id) {
    var node;

    if (!id) {
      id = this.BODY;
    }

    switch (id) {
      case HEAD:
        node = this.getDomNode('head');
      break;

      case BODY:
        node = this.getDomNode('body');
      break;
    }

    return node;

  },


  /**
   * Method that returns the HTML element for the provided tag.
   *
   * @param string The node tag.
   *
   * @return HTMLElement
   */
  getDomNode: function (nodeTag) {
    var nodes = document.getElementsByTagName(nodeTag);
    return nodes[0] || false;
  }
};

module.exports = {
  inject: function (node, parentNodeTag, position) {
    return Injector.inject(node, parentNodeTag, position);
  },

  AT_START: AT_START,
  AT_END: AT_END,
  HEAD: HEAD,
  BODY: BODY
};
