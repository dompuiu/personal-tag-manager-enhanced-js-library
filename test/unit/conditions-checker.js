var ConditionsChecker = require('./../../src/engine/conditions-checker');

describe('ConditionsChecker', function() {
  describe('#getRawValues()', function() {
    it('should return trimmed keys and values', function() {
      var data = 's_nr=1384866796184; mbox=check#true#1385024444|session#1385024383007-711301#1385026244',
        result = new ConditionsChecker().getRawValues(data, ';');

      expect(result['s_nr']).to.exist;
      expect(result['mbox']).to.exist;

      expect(result['s_nr']).to.equal('1384866796184');
      expect(result['mbox']).to.equal('check#true#1385024444|session#1385024383007-711301#1385026244');
    });

    it('should match query parameters', function() {
      var checker = new ConditionsChecker([{
        "condition": "contains",
        "not": false,
        "param": "query",
        "param_name": "p",
        "values": {"scalar":"jquery"}
      }], {
        location: {
          search: "?p=jquery"
        }
      });

      expect(checker.conditionsAreFullfilled()).to.be.true;
    });

    it('should match host', function() {
      var checker = new ConditionsChecker([{
        "condition": "contains",
        "not": false,
        "param": "host",
        "param_name": false,
        "values": {"scalar":"myhost"}
      }], {
        location: {
          hostname: "myhost:8000"
        }
      });

      expect(checker.conditionsAreFullfilled()).to.be.true;
    });

    it('should match date range', function() {
      var today = new Date();

      var checker = new ConditionsChecker([{
        "condition": "daterange",
        "not": false,
        "param": "date",
        "param_name": false,
        "values": {
          "min": `${today.getFullYear()}/01/01`,
          "max": `${today.getFullYear() + 1}/01/01`,
        }
      }]);

      expect(checker.conditionsAreFullfilled()).to.be.true;
    });
  });
});
