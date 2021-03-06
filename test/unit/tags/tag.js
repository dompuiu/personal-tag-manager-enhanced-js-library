var Tag = require('./../../../src/engine/tags/tag');
var Injector = require('./../../../src/engine/injector');

describe('Tag', function() {
  describe('#constructor()', function() {
    it('should have the default properties when no data is sent to constructor', function() {
      var cnt = new Tag();
      expect(cnt.data.src).to.be.empty;
      expect(cnt.data.inject.tag).to.be.equal(Injector.BODY);
      expect(cnt.data.inject.position).to.be.equal(Injector.AT_END);
    });

    it('should generate an ID automatically if none is provided', function() {
      var cnt = new Tag();
      expect(cnt.data.id).to.be.ok;
    });

    it('should contain the id from the constructor provided parameters', function() {
      var id = 'myid',
        cnt = new Tag({
          id: id,
          src: 'some src'
        });

      expect(cnt.data.id).to.be.equal(id);
    });
  });

  describe('#generateId()', function() {
    it('should generate a unique id when no id is provided', function() {
      var cnt = new Tag();
      expect(cnt.data.id).to.not.be.empty;
    });

    it('should not generate a new id for component having an id provided in constructor', function() {
      var id = 'myid',
        cnt = new Tag({
          'id': id
        });
      expect(cnt.data.id).to.be.equal(id);
    });


    it('should not generate a new id when another component has the same id', function() {
      var backup = Tag.getById,
        found = false;

      var id = 'myid',
        cnt = new Tag({
          'id': id
        });

      Tag.getById = function() {
        if (found === false) {
          found = true;
          return true;
        }

        return null;
      };

      var cnt2 = new Tag({
        'id': id
      });

      expect(cnt.data.id).to.not.be.equal(cnt2.data.id);

      Tag.getById = backup;
    });
  });

  describe('#getById()', function() {
    it('should return null when no tag is found for the recieved id', function() {
      expect(Tag.getById('myid')).to.be.null;
    });

    it('should return a tag based on the received id', function() {
      var tag = {
        data: {
          id: 'myid'
        }
      };

      Tag.tags = [tag];

      expect(Tag.getById('myid')).to.be.deep.equal(tag);
    });
  });
});
