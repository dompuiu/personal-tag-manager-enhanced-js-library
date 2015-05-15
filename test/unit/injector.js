var HtmlInjector = require('./../../src/engine/injector');

describe('HtmlInjector', function () {
  var getNode, deleteNode;

  getNode = function (tag) {
    var node;

    if (!tag) {
      tag = 'div';
    }
    node = document.createElement(tag);
    node.id = 'test-node';
    node.innerHTML = "var scriptcode='a';";
    return node;
  };

  deleteNode = function () {
    var node = document.getElementById('test-node');
    if (node) {
      node.parentNode.removeChild(node);
    }
  };

  afterEach(function () {
    deleteNode();
  });

  describe('#inject()', function () {
    it('should return false when node to be inserted is not provided', function () {
      expect(HtmlInjector.inject()).to.be.false;
    });

    it('should return false when invalid parentNodeTag parameter is provided', function () {
      expect(HtmlInjector.inject(getNode(), -1)).to.be.false;
    });

    it('should append the node as the first child in the HEAD', function () {
      var node = getNode('script');
      expect(HtmlInjector.inject(node, 1, 1)).to.be.true;
      expect(document.getElementsByTagName('head')[0].firstChild).to.be.equal(node);
    });

    it('should append the node as the last child in the HEAD', function () {
      var node = getNode('script');
      expect(HtmlInjector.inject(node, 1, 2)).to.be.true;
      expect(document.getElementsByTagName('head')[0].lastChild).to.be.equal(node);
    });

    it('should append the node as the first child in the BODY', function () {
      var node = getNode();
      expect(HtmlInjector.inject(node, 2, 1)).to.be.true;
      expect(document.getElementsByTagName('body')[0].firstChild).to.be.equal(node);
    });

    it('should append the node as the last child in the BODY', function () {
      var node = getNode();
      expect(HtmlInjector.inject(node, 2, 2)).to.be.true;
      expect(document.getElementsByTagName('body')[0].lastChild).to.be.equal(node);
    });

    it('should append the node as the last child in the BODY if only the node is provided', function () {
      var node = getNode();
      expect(HtmlInjector.inject(node)).to.be.true;
      expect(document.getElementsByTagName('body')[0].lastChild).to.be.equal(node);
    });

    it('should convert the parentNodeTag parameter to integer before doing the insertion', function () {
      var node = getNode();
      expect(HtmlInjector.inject(node, "2")).to.be.true;
      expect(document.getElementsByTagName('body')[0].lastChild).to.be.equal(node);
    });

    it('should convert the position parameter to integer before doing the insertion', function () {
      var node = getNode();
      expect(HtmlInjector.inject(node, "2", "2")).to.be.true;
      expect(document.getElementsByTagName('body')[0].lastChild).to.be.equal(node);
    });
  });
});
