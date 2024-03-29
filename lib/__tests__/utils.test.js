const Utils = require('../utils');

const getRange = () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return [today.toISOString(), yesterday.toISOString()];
};

describe('Utils', () => {
  describe('equals', () => {
    it('should return truthy despite case mismatch', () =>
      expect(Utils.equals('TestMe', 'testme')).toBeTruthy());

    it('should return truthy despite locale mismatch', () =>
      expect(Utils.equals('e', 'é')).toBeTruthy());

    it('should return truthy on alpha-numerics', () =>
      expect(Utils.equals('10', 10)).toBeTruthy());

    it('should return truthy on true/bool', () =>
      expect(Utils.equals('true', true)).toBeTruthy());

    it('should return truthy on false/bool', () =>
      expect(Utils.equals('false', false)).toBeTruthy());

    it('should return falsy on alpha mismatch', () =>
      expect(Utils.equals('TestMe', 'Test', 'en')).toBeFalsy());

    it('should return falsy on numeric mismatch', () =>
      expect(Utils.equals('12', 123)).toBeFalsy());

    it('should return falsy on empty', () =>
      expect(Utils.equals('', '*')).toBeFalsy());

    it('should return truthy on wildcard', () =>
      expect(Utils.equals('a', '*')).toBeTruthy());
  });

  describe('"doesNotEqual"', () => {
    it('should return truthy', () =>
      expect(Utils.doesNotEqual('foo', 'bar')).toBeTruthy());

    it('should return falsy', () =>
      expect(Utils.doesNotEqual('foo', 'foo')).toBeFalsy());

    it('should return falsy', () =>
      expect(Utils.doesNotEqual(2, 2)).toBeFalsy());

    it('should return falsy when one in list matches', () =>
      expect(Utils.doesNotEqual('1', '1,2')).toBeFalsy());

    it('should return truthy none in list matches', () =>
      expect(Utils.doesNotEqual('1', [2, 3])).toBeTruthy());

    it('should return truthy on wildcard', () =>
      expect(Utils.doesNotEqual('', '*')).toBeTruthy());

    it('should return truthy on wildcard', () =>
      expect(Utils.doesNotEqual(undefined, '*')).toBeTruthy());

    it('should return truthy on wildcard', () =>
      expect(Utils.doesNotEqual(null, '*')).toBeTruthy());
  });

  describe('isGreaterThan', () => {
    it('should return truthy on numerics', () =>
      expect(Utils.isGreaterThan(123, 12)).toBeTruthy());

    it('should return truthy on dates', () => {
      const [t, y] = getRange();
      expect(Utils.isGreaterThan(t, y)).toBeTruthy();
    });

    it('should return falsy on less-than dates', () => {
      const [t, y] = getRange();
      expect(Utils.isGreaterThan(y, t)).toBeFalsy();
    });

    it('should return falsy on incongruent types', () => {
      expect(Utils.isGreaterThan(new Date(), 123)).toBeFalsy();
    });

    it('should return truthy on alpha', () =>
      expect(Utils.isGreaterThan('300', '10')).toBeTruthy());

    it('should return falsy in less-than situations', () =>
      expect(Utils.isGreaterThan('10', '11')).toBeFalsy());
  });

  describe('isLessThan', () => {
    it('should return truthy on numerics', () =>
      expect(Utils.isLessThan(12, 123)).toBeTruthy());

    it('should return truthy on dates', () => {
      const [t, y] = getRange();
      expect(Utils.isLessThan(y, t)).toBeTruthy();
    });

    it('should return truthy on strings', () =>
      expect(Utils.isLessThan('abc', 'def')).toBeTruthy());
  });

  describe('isLessThanOrEqualTo', () => {
    it('should return truthy on match', () =>
      expect(Utils.isLessThanOrEqualTo('abc', 'abc')).toBeTruthy());

    it('should return truthy on less than', () =>
      expect(Utils.isLessThanOrEqualTo('abc', 'def')).toBeTruthy());

    it('should return truthy on less than', () =>
      expect(Utils.isLessThanOrEqualTo(1, 2)).toBeTruthy());

    it('should return truthy on equal value', () =>
      expect(Utils.isLessThanOrEqualTo(22, 22)).toBeTruthy());
  });

  describe('isGreaterThanOrEqualTo', () => {
    it('should return truthy on match', () =>
      expect(Utils.isGreaterThanOrEqualTo('def', 'zylo')).toBeFalsy());

    it('should return truthy on equal value', () =>
      expect(Utils.isGreaterThanOrEqualTo(1, 2)).toBeFalsy());
  });

  describe('isEmpty', () => {
    it('should return truthy on null', () =>
      expect(Utils.isEmpty(null)).toBeTruthy());

    it('should return truthy on undefined', () =>
      expect(Utils.isEmpty(undefined)).toBeTruthy());

    it('should return falsy on false', () =>
      expect(Utils.isEmpty(false)).toBeFalsy());
  });

  describe('Validate', () => {
    it('should detect ObjectId as string', () =>
      expect(
        Utils.validate('5f0dc7481681ee00225164a7').numeric(),
      ).toBeFalsy());
  });
});
