var PubSub = require('./../../src/engine/publish-subscribe');

describe('PubSub', function() {
  describe('#subscribe()', function() {
    var pubsub;

    beforeEach(function() {
      pubsub = new PubSub();
    });

    afterEach(function() {
      pubsub.reset();
    });

    it('should call imediately the callback with messages from archive if necessary', function() {
      var called = 0;
      pubsub.publishSync('messagetoarchive');
      pubsub.subscribe('messagetoarchive', function() {
        called = 1;
      });
      expect(called).to.be.equal(1);
    });

    it('should call imediately the callback with messages from archive the correct number of times', function() {
      var times = 4,
        called = 0,
        i = 0;
      for (i = 0; i < times; i += 1) {
        pubsub.publishSync('messagetoarchive');
      }

      pubsub.subscribe('messagetoarchive', function() {
        called += 1;
      });
      expect(called).to.be.equal(times);
    });

    it('should deep call imediately the callback with messages from archive', function() {
      var called = 0;

      pubsub.publishSync('car.purchase', {
        name: 'my new car'
      });
      pubsub.publishSync('car.drive', {
        speed: '14'
      });
      pubsub.publishSync('car.sell', {
        newOwner: 'someone else'
      });

      pubsub.subscribe('car.drive', function() {
        called += 1;
      });
      expect(called).to.be.equal(1);
    });

    it('should deep call imediately the callback with messages from archive the correct number of times', function() {
      var called = 0;

      pubsub.publishSync('car.purchase', {
        name: 'my new car'
      });
      pubsub.publishSync('car.drive', {
        speed: '14'
      });
      pubsub.publishSync('car.sell', {
        newOwner: 'someone else'
      });

      pubsub.subscribe('car', function() {
        called += 1;
      });
      expect(called).to.be.equal(3);
    });
  });
});
