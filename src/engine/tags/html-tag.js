var Tag = require('./tag');
var ScriptTag = require('./script-tag');

/**
 * Html tag class.
 *
 * This class parse the HTML code it receives. It splits the HTML in chunks.
 * When finds a script tag, it inserts it using a JavaScriptTag object.
 * All other nodes are appended as they are found directly to the page.
 *
 * @param string           The tag data.
 * @param TagLoader The loader instance that has instantiated the tag.
 *
 * @return void
 */

class HtmlTag extends Tag {
  constructor(data, loader_instance) {
    super(data, loader_instance);
  }

    /**
   * Building the DOM node that will be appended to the page.
   *
   * If `script` tags are found in the source, they are removed and sent to
   * be handled by their corresponding class. If no script tags are found,
   * the HTML nodes will be appended in the page.
   *
   * @return Boolean|DocumentFragment The Dom fragment if the HTML source
   *                                  doesn't contain `script` tags.
   *                                  False otherwise.
   */
  getDomNode() {
    var fragment, chunks_config;

    if (!this.data.src) {
      return false;
    }

    fragment = this.buildDocumentFragmentNode(this.data.src);
    if (fragment === false) {
      return false;
    }

    if (this.data.src.indexOf('<script') === -1) {
      this.addOnLoadEvents(fragment);
      return fragment;
    }

    chunks_config = this.getConfigChunksFromHtml(fragment);
    this.appendNodesWithSeparateLoader(chunks_config);

    return false;
  }

  /**
   * Create a document fragment from a string source.
   *
   * @param string The source from which the document fragment is built.
   *
   * @return DocumentFragment The DocumentFragment object.
   */
  buildDocumentFragmentNode(src) {
    var d = document.createElement('div'),
      fragment,
      first_child;

    fragment = document.createDocumentFragment();
    if (!src) {
      return fragment;
    }

    // Trimming the src before appending it.
    d.innerHTML = "a<div>" + src.replace(/^\s\s*/, '') + "</div>";
    d = d.lastChild;

    if (d.childNodes.length === 0) {
      return false;
    }

    while (d.firstChild) {
      first_child = d.removeChild(d.firstChild);
      fragment.appendChild(first_child);
    }

    return fragment;
  }


  /**
   * Add to the fragment provided an `ontagload` call.
   *
   * @param DocumentFragment The fragment where this callback will be appended.
   *
   * @return void
   */
  addOnLoadEvents(fragment) {
    var s = ScriptTag.prototype.getScriptNode(false);
    s.text = this.getOnTagLoadPageCode(false);

    fragment.appendChild(s);
  }


  /**
   * Scan the received fragment and split it in chunks. There are two types of
   * chunks: HTML and SCRIPT nodes.
   *
   * @param DocumentFragment The fragment which will be scanned.
   *
   * @return Array An array containing configs.
   */
  getConfigChunksFromHtml(fragment) {
    var result = [],
      d = document.createElement('div'),
      first_child;

    if (!fragment) {
      return result;
    }

    while (fragment.firstChild) {
      first_child = fragment.removeChild(fragment.firstChild);

      if (first_child.tagName === 'SCRIPT') {
        if (d.childNodes.length > 0) {
          result.push(this.getHtmlConfigFromChunk(d));
          d.innerHTML = '';
        }

        result.push(this.getScriptConfigFromChunk(first_child));
      } else {
        d.appendChild(first_child);
      }
    }

    if (d.childNodes.length > 0) {
      result.push(this.getHtmlConfigFromChunk(d));
    }

    return result;
  }


  /**
   * Return an html config for the specified chunk.
   *
   * @param DocumentFragment The fragment from which the HTML will be extracted.
   *
   * @return Object Tag config object.
   */
  getHtmlConfigFromChunk(node) {
    var src = node.innerHTML;

    return {
      src: src,
      type: 'html'
    };
  }


  /**
   * Return an `script` or `js` config for the specified chunk.
   *
   * @param DocumentFragment The fragment from which the config will be extracted.
   *
   * @return Object Tag config object.
   */
  getScriptConfigFromChunk(node) {
    if (node.src !== '') {
      return {
        src: node.src,
        type: 'script'
      };
    } else if (node.text !== '') {
      return {
        src: node.text,
        type: 'js'
      };
    }

    return false;
  }


  /**
   * Add nodes to the page with a separate instance of TagLoader.
   *
   * @param array Tag configs.
   *
   * @return void
   */
  appendNodesWithSeparateLoader(configs) {
    var TagLoader = require('../tag-loader');
    var local_loader = new TagLoader(configs, true),
      scope = this;

    local_loader.subscribe('onload', function() {
      scope.loader_instance.publish('ontagload.' + scope.data.id, {
        id: scope.data.id,
        tag: scope
      });

      scope.loader_instance.resume();
    });

    this.loader_instance.pause();
    local_loader.loadNext();
  }
}

module.exports = HtmlTag;
