var HtmlTag = require('./../../../src/engine/tags/html-tag');

describe('HtmlTag', function() {
  describe('#buildDocumentFragmentNode()', function() {
    it('should return an empty document fragment when no source is provided', function() {
      var result = HtmlTag.prototype.buildDocumentFragmentNode();
      expect(result.childNodes).to.have.length(0);
    });

    it('should return a document fragment with one child when an html containing one tag is provided', function() {
      var src = '<div>some string</div>',
        result = HtmlTag.prototype.buildDocumentFragmentNode(src);

      expect(result.childNodes).to.have.length(1);
    });

    it('should return a document fragment with two childs when an html containing two tags is provided', function() {
      var src = '<div>some string</div><div>some other string</div>',
        result = HtmlTag.prototype.buildDocumentFragmentNode(src);

      expect(result.childNodes).to.have.length(2);
    });
  });

  describe('#getConfigChunksFromHtml()', function() {
    it('should return an empty array when no source is provided', function() {
      var result = HtmlTag.prototype.getConfigChunksFromHtml();

      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should return an array with one entry when an html containing one tag but not a script tag is provided', function() {
      var src = '<div>some string</div>',
        fragment = HtmlTag.prototype.buildDocumentFragmentNode(src),
        result = HtmlTag.prototype.getConfigChunksFromHtml(fragment);

      expect(result).to.be.an('array');
      expect(result).to.have.length(1);

      expect(result[0]).to.have.property('type', 'html');
      expect(result[0]).to.have.property('src', src);
    });

    it('should return an array with one entry when an html containing two tags, but without any script tag, is provided', function() {
      var src = '<div>some string</div><div>some other string</div>',
        fragment = HtmlTag.prototype.buildDocumentFragmentNode(src),
        result = HtmlTag.prototype.getConfigChunksFromHtml(fragment);

      expect(result).to.be.an('array');
      expect(result).to.have.length(1);

      expect(result[0]).to.have.property('type', 'html');
      expect(result[0]).to.have.property('src', src);
    });

    it('should return an array with two entries when an html containing two tags is provided; the second of them being an inline script tag', function() {
      var src = '<div>some string</div><script>console.log</script>',
        fragment = HtmlTag.prototype.buildDocumentFragmentNode(src),
        result = HtmlTag.prototype.getConfigChunksFromHtml(fragment);

      expect(result).to.be.an('array');
      expect(result).to.have.length(2);

      expect(result[0]).to.have.property('type', 'html');
      expect(result[0]).to.have.property('src', '<div>some string</div>');

      expect(result[1]).to.have.property('type', 'js');
      expect(result[1]).to.have.property('src', 'console.log');
    });

    it('should return an array with two entries when an html containing two tags is provided; the first of them being a remote script tag', function() {
      var src = '<script src="http://google.com/jquery.js"></script><div>some string</div>',
        fragment = HtmlTag.prototype.buildDocumentFragmentNode(src),
        result = HtmlTag.prototype.getConfigChunksFromHtml(fragment);

      expect(result).to.be.an('array');
      expect(result).to.have.length(2);

      expect(result[0]).to.have.property('type', 'script');
      expect(result[0]).to.have.property('src', 'http://google.com/jquery.js');

      expect(result[1]).to.have.property('type', 'html');
      expect(result[1]).to.have.property('src', '<div>some string</div>');
    });


    it('should return an array with three entries when an html containing three tags is provided; the one in the middle being a remote script tag', function() {
      var src = '<div>some other string</div><script src="http://google.com/jquery.js"></script><div>some string</div>',
        fragment = HtmlTag.prototype.buildDocumentFragmentNode(src),
        result = HtmlTag.prototype.getConfigChunksFromHtml(fragment);

      expect(result).to.be.an('array');
      expect(result).to.have.length(3);

      expect(result[0]).to.have.property('type', 'html');
      expect(result[0]).to.have.property('src', '<div>some other string</div>');

      expect(result[1]).to.have.property('type', 'script');
      expect(result[1]).to.have.property('src', 'http://google.com/jquery.js');

      expect(result[2]).to.have.property('type', 'html');
      expect(result[2]).to.have.property('src', '<div>some string</div>');
    });
  });
});
