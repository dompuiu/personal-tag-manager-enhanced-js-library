var SynchronousScriptTag = require('./../../../src/engine/tags/synchronous-script-tag');

describe('SynchronousScriptTag', function() {
  describe('#constructor()', function() {
    it('should have the default properties when no data is sent to constructor', function() {
      var cnt = new SynchronousScriptTag();
      expect(cnt.data.attributes.async).to.be.false;
      expect(cnt.data.attributes.defer).to.be.false;
    });

    it('should have defer attribute set to true when provided in tag', function() {
      var cnt = new SynchronousScriptTag({
        attributes: {
          defer: true
        }
      });
      expect(cnt.data.attributes.defer).to.be.true;
    });
  });
});
