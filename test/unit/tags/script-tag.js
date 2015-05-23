var ScriptTag = require('./../../../src/engine/tags/script-tag');

describe('ScriptTag', function() {
  describe('#constructor()', function() {
    it('should have the default properties when no data is sent to constructor', function() {
      var cnt = new ScriptTag();
      expect(cnt.data.attributes.async).to.be.true;
      expect(cnt.data.attributes.defer).to.be.true;
    });

    it('should have defer attribute set to true when provided in tag', function() {
      var cnt = new ScriptTag({
        attributes: {
          defer: true
        }
      });
      expect(cnt.data.attributes.defer).to.be.true;
    });
  });

  describe('#getDomNode()', function() {
    it('should return a DOM node that has async attribute set to it', function() {
      var cnt = new ScriptTag({
          src: 'someurl'
        }),
        node = cnt.getDomNode();

      expect(node.getAttribute('async')).to.be.empty;
    });

    it('should return a DOM node that has defer attribute set to it', function() {
      var cnt = new ScriptTag({
          src: 'someurl',
          attributes: {
            async: false,
            defer: true
          }
        }),
        node = cnt.getDomNode();

      expect(node.getAttribute('defer')).to.be.empty;
      expect(node.getAttribute('async')).to.be.null;
    });

    it('should return a DOM node that has defer and async attributes set to it', function() {
      var cnt = new ScriptTag({
          src: 'someurl',
          attributes: {
            defer: true
          }
        }),
        node = cnt.getDomNode();

      expect(node.getAttribute('defer')).to.be.empty;
      expect(node.getAttribute('async')).to.be.empty;
    });
  });
});
