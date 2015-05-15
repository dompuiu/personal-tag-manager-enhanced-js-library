var ScriptTag = require('./../../../src/engine/tags/script-tag');
var JavaScriptTag = require('./../../../src/engine/tags/javascript-tag');

describe('JavaScriptTag', function() {
  describe('#constructor()', function() {
    it('should have the default properties when no data is sent to constructor', function() {
      var cnt = new JavaScriptTag();
      expect(cnt.data.attributes.async).to.be.false;
      expect(cnt.data.attributes.defer).to.be.false;
    });

    it('should have defer attribute set to true when provided in container', function() {
      var cnt = new JavaScriptTag({
        attributes: {
          defer: true
        }
      });
      expect(cnt.data.attributes.defer).to.be.true;
    });
  });
});
