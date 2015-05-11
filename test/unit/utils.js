var Utils = require('./../../src/engine/utils');

describe('Utils', function () {
  describe('#executeJavaScript()', function () {
    afterEach(function () {
      delete window.scriptutil;
    });

    it('should execute javascript in the global context', function () {
      expect(window.scriptutil).to.be.undefined;
      Utils.executeJavaScript('var scriptutil = 100;');
      expect(window.scriptutil).to.be.equal(100);
    });

    it('should execute javascript in the global context only valid javascript', function () {
      expect(window.scriptutil).to.be.undefined;
      Utils.executeJavaScript('var scriptutil 100;');
      expect(window.scriptutil).to.be.undefined;
    });
  });

  describe('#jsonDecode()', function () {
    it('should return null when called without any parameter', function () {
      assert.isNull(Utils.jsonDecode());
    });

    it('should return a string when receiving a string encoded as JSON', function () {
      assert.isString(Utils.jsonDecode('"string"'));
    });

    it('should return a number when receiving a number encoded as JSON', function () {
      assert.isNumber(Utils.jsonDecode('10'));
    });

    it('should return a boolean when receiving a boolean encoded as JSON', function () {
      assert.isBoolean(Utils.jsonDecode('true'));
    });

    it('should return a null when receiving a null encoded as JSON', function () {
      assert.isNull(Utils.jsonDecode('null'));
    });

    it('should return an array when receiving an array encoded as JSON', function () {
      assert.isArray(Utils.jsonDecode('[1,2,3]'));
    });

    it('should return an object when receiving an object encoded as JSON', function () {
      assert.isObject(Utils.jsonDecode('{"key": "value"}'));
    });

    it('should return null when receiving an invalid JSON', function () {
      assert.isNull(Utils.jsonDecode('"string'));
    });
  });

describe('#isArray()', function () {
  it('should return true when receiving an array', function () {
    expect(Utils.isArray([1, 2, 3])).to.be.true;
  });

  it('should return false when receiving a string', function () {
    expect(Utils.isArray('string')).to.be.false;
  });

  it('should return false when receiving a number', function () {
    expect(Utils.isArray(1)).to.be.false;
  });

  it('should return false when receiving a null value', function () {
    expect(Utils.isArray(null)).to.be.false;
  });

  it('should return false when receiving an object', function () {
    expect(Utils.isArray({key: "value"})).to.be.false;
  });
});

describe('#isObject()', function () {
  it('should return true when receiving an object', function () {
    expect(Utils.isObject({key: "value"})).to.be.true;
  });

  it('should return false when receiving a string', function () {
    expect(Utils.isObject('string')).to.be.false;
  });

  it('should return false when receiving a number', function () {
    expect(Utils.isObject(1)).to.be.false;
  });

  it('should return false when receiving a null value', function () {
    expect(Utils.isObject(null)).to.be.false;
  });

  it('should return false when receiving an array', function () {
    expect(Utils.isObject([1, 2, 3])).to.be.false;
  });
});

describe('#onDomReady()', function () {
  afterEach(function () {
    delete window.scriptutil;
  });

  it('should run a callback imediatelly after the page onload event has been triggered', function () {
    var e;
    expect(window.scriptutil).to.be.undefined;
    Utils.onDomReady(function (event) {
      e = event;
      window.scriptutil = 100;
    });
    expect(window.scriptutil).to.be.equal(100);
    expect(e).to.be.equal('lazy');
  });
});

describe('#isDomReady()', function () {
  it('should return true after the DOM is ready', function () {
    expect(Utils.isDomReady()).to.be.true;
  });
});

describe('#mergeObject()', function () {
  it('should merge from the source object to the destination object only the properties that exists in both objects', function () {
    var obj2  = {src: 10}, obj1 = {src: 100};
    obj1 = Utils.mergeObject(obj1, obj2);
    expect(obj1).to.deep.equal(obj2);
  });

  it('should not merge from the source object to the destination object properties that don\'t exist in both objects', function () {
    var obj2  = {src: 10}, obj1 = {};
    obj1 = Utils.mergeObject(obj1, obj2);
    expect(obj1).to.not.have.property('src');
  });

  it('should merge all the properties from source when the safe flag is set to false', function () {
    var obj2  = {src: 10}, obj1 = {};
    obj1 = Utils.mergeObject(obj1, obj2, false);
    expect(obj1).to.have.property('src').and.equal(10);
  });

  it('should deep merge from the source object to the destination object only the properties that exists in both objects', function () {
    var obj1, obj2;

    obj1 = {
      src: 'some src',
      attributes: {
        defer: true
      }
    };

    obj2 = {
      src: 'other src',
      attributes: {
        defer: false,
        async: true
      }
    };

    obj1 = Utils.mergeObject(obj1, obj2);
    expect(obj1).to.have.property('src', obj2.src);
    expect(obj1).to.have.deep.property('attributes.defer', obj2.attributes.defer);
    expect(obj1).to.not.have.deep.property('attributes.async');
  });

  it('should deep merge all unsafe properties that exist in both objects when safe flag is set to false', function () {
    var obj1, obj2;

    obj1 = {
      src: 'some src',
      attributes: {
        defer: true
      }
    };

    obj2 = {
      src: 'other src',
      attributes: {
        defer: false,
        async: true
      }
    };

    obj1 = Utils.mergeObject(obj1, obj2, false);
    expect(obj1).to.have.property('src', obj2.src);
    expect(obj1).to.have.deep.property('attributes.defer', obj2.attributes.defer);
    expect(obj1).to.have.deep.property('attributes.async', obj2.attributes.async);
  });

  it('should create an array when it finds it in the source object', function () {
    var obj1, obj2;

    obj1 = {
      src: 'some src',
      attributes: {
        defer: true
      }
    };

    obj2 = {
      src: 'other src',
      attributes: {
        defer: false,
        async: true
      },
      match: []
    };

    obj1 = Utils.mergeObject(obj1, obj2, false);
    expect(obj1).to.have.property('match');
  });

  it('should append  entries from source object to the destination object for arrays', function () {
    var obj1, obj2;

    obj1 = {
      src: 'some src',
      attributes: {
        defer: true
      },
      match: [1, 2, 3]
    };

    obj2 = {
      src: 'other src',
      attributes: {
        defer: false,
        async: true
      },
      match: [4, 5]
    };

    obj1 = Utils.mergeObject(obj1, obj2);
    expect(obj1).to.have.property('match');
    expect(obj1.match).to.eql([1, 2, 3, 4, 5]);
  });
});

describe('#getSanitizedValue()', function () {
  it('should return the same value when no sanitized filer is used', function () {
    assert.isNumber(Utils.getSanitizedValue(8));
    assert.isBoolean(Utils.getSanitizedValue(true));
    assert.isArray(Utils.getSanitizedValue([]));
    assert.isObject(Utils.getSanitizedValue({}));
    assert.isNull(Utils.getSanitizedValue(null));
    assert.isUndefined(Utils.getSanitizedValue(undefined));
  });

  it('should return a string when the string sanitize filter is used', function () {
    assert.isString(Utils.getSanitizedValue(8, 'string'));
    assert.isString(Utils.getSanitizedValue(true, 'string'));
    assert.isString(Utils.getSanitizedValue([], 'string'));
    assert.isString(Utils.getSanitizedValue({}, 'string'));
    assert.isString(Utils.getSanitizedValue(null, 'string'));
    assert.isString(Utils.getSanitizedValue(undefined, 'string'));
  });

  it('should return a string when the boolean sanitize filter is used', function () {
    assert.isBoolean(Utils.getSanitizedValue(8, 'boolean'));
    assert.isBoolean(Utils.getSanitizedValue(true, 'boolean'));
    assert.isBoolean(Utils.getSanitizedValue([], 'boolean'));
    assert.isBoolean(Utils.getSanitizedValue({}, 'boolean'));
    assert.isBoolean(Utils.getSanitizedValue(null, 'boolean'));
    assert.isBoolean(Utils.getSanitizedValue(undefined, 'boolean'));
  });

  it('should return a timestamp when the date sanitize filter is used', function () {
    assert.isNumber(Utils.getSanitizedValue('2012/11/11', 'date'));
  });

  it('should return -1 when the date sanitize filter is used on an invalid date', function () {
    expect(Utils.getSanitizedValue('20111/11/11', 'date')).to.equal(-1);
  });
});

describe('#getSanitizedObject()', function () {
  var validation, source, result;

  validation = {
    'type': 'string',
    'src': 'string',
    'attributes': {
      'async': 'boolean',
      'defer': 'boolean'
    },
    'match': {
      'date_start': 'date',
      'date_end': 'date',
      'host': 'string',
      'path': 'string',
      'query': 'number',
      'query_value': 'string',
      'cookie': 'string',
      'cookie_value': 'string'
    },
    'match_arr': {
      'date_start': 'date',
      'date_end': 'date',
      'host': 'string',
      'path': 'string',
      'query': 'number',
      'query_value': 'string',
      'cookie': 'string',
      'cookie_value': 'string',
      'values': {
        'days': 'number'
      }
    }
  };

  source = {
    'type': 'string',
    'src': 10,
    'attributes': {
      'async': true,
      'defer': 0
    },
    'match': {
      'date_start': '2011/11/11',
      'date_end': '201111/11/11',
      'host': true,
      'path': undefined,
      'query': '10'
    },
    'match_arr': [{
      'date_start': '2011/11/11',
      'date_end': '201111/11/11',
      'host': true,
      'path': undefined,
      'query': '10',
      'values': {
        'days': ["0", "1", "2"]
      }
    }]
  };

  result = {
    'type': 'string',
    'src': '10',
    'attributes': {
      'async': true,
      'defer': false
    },
    'match': {
      'date_start': Date.UTC('2011', '10', '11'),
      'date_end': -1,
      'host': 'true',
      'path': 'undefined',
      'query': 10
    },
    'match_arr': [{
      'date_start': Date.UTC('2011', '10', '11'),
      'date_end': -1,
      'host': 'true',
      'path': 'undefined',
      'query': 10,
      'values': {
        'days': [0, 1, 2]
      }
    }]
  };

  it('should return an object having sanitized values', function () {
    source = Utils.getSanitizedObject(source, validation);
    expect(source).to.eql(result);
  });
});
});
