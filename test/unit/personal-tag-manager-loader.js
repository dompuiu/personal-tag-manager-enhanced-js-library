var PersonalTagManagerLoader = require('./../../src/engine/personal-tag-manager-loader');

describe('TagManagerLoader', function() {
  var load_next_container_spy, loader;

  before(function() {
    loader = new PersonalTagManagerLoader(null, null, window);
    load_next_container_spy = sinon.spy(loader, "loadNextContainer");
  });


  afterEach(function() {
    load_next_container_spy.reset();
    loader.reset();
  });

  describe('#loadNextContainer()', function() {
    it('should not load any container if array is not provided as parameter', function() {
      loader.addToQueue('some string');
      loader.loadNextContainer();

      expect(load_next_container_spy.calledOnce).to.be.ok;
    });

    it('should load all containers if array is provided as parameter', function() {
      var containers = [0, 1];
      loader.addToQueue(containers);
      loader.loadNextContainer();

      expect(load_next_container_spy.calledThrice).to.be.ok;
    });
  });

  describe('#addToQueue()', function() {
    it('should not append any new loader if array is not provided', function() {
      var result = loader.addToQueue('some string');

      expect(result).to.be.false;
      expect(loader.load_queue).to.be.empty;
    });

    it('should append the provided loaders if the current loaders property is not array ', function() {
      var loaders = [0, 1, 2];
      var result = loader.addToQueue(loaders);

      expect(result).to.be.true;
      expect(loader.load_queue).to.eql(loaders);
    });

    it('should append the provided loaders if the current loaders property is array ', function() {
      var initial_loaders = [0, 1, 2],
        loaders = [3, 4],
        combined_loaders = [0, 1, 2, 3, 4];

      loader.load_queue = initial_loaders;
      var result = loader.addToQueue(loaders);

      expect(result).to.be.true;
      expect(loader.load_queue).to.eql(combined_loaders);
    });

    it('should prepend the provided loaders if the current loaders property is array ', function() {
      var initial_loaders = [0, 1, 2],
        loaders = [3, 4],
        combined_loaders = [3, 4, 0, 1, 2];

      loader.load_queue = initial_loaders;
      var result = loader.addToQueue(loaders, true);

      expect(result).to.be.true;
      expect(loader.load_queue).to.eql(combined_loaders);
    });
  });

});
