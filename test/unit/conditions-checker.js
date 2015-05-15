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
  });
});
