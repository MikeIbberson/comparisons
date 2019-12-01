const sift = require('sift').default;
const Comparison = require('..');

const exp = [
  'foo=bar',
  'age<30',
  'age>=21',
  'language=EN',
  'bestFriend.name=jon',
];

const stub = {
  foo: 'bar',
  age: 21,
  language: 'en',
  bestFriend: {
    name: 'Jon',
  },
};

describe('Comparison', () => {
  describe('isValid', () => {
    it('should return truthy', () => {
      expect(Comparison.isValid('>')).toBeTruthy();
      expect(Comparison.isValid('<')).toBeTruthy();
      expect(Comparison.isValid('>=')).toBeTruthy();
      expect(Comparison.isValid('<=')).toBeTruthy();
    });
  });

  describe('eval', () => {
    it('should return truthy', () =>
      expect(new Comparison(exp).eval(stub)).toBeTruthy());

    it('should return falsy', () =>
      expect(
        new Comparison(['age>22', 'language=FR']).eval(stub),
      ).toBeFalsy());
  });

  describe('query', () => {
    it('should return as mongo query', () =>
      expect(new Comparison(exp).query(stub)).toMatchObject({
        $and: [
          { foo: /bar/gi },
          { age: { $lt: 30 } },
          { age: { $gte: 21 } },
          { language: /EN/gi },
          { 'bestFriend.name': /jon/gi },
        ],
      }));

    it('should return the stub on query', () => {
      const query = new Comparison(exp).query();
      expect([stub].filter(sift(query))).toHaveLength(1);
    });

    it('should match with several stubs', () => {
      const date = new Date('2018-03-22').toISOString();
      const query = new Comparison([
        'low>2',
        'high<10',
        'word=hi',
        `date=${date}`,
      ]).query();

      const result = [
        {
          low: 1,
          high: 12,
          word: 'hi',
          date: new Date().toISOString(),
        },
        { low: 3, high: 6, word: 'hi', date },
        { low: 4, high: 8, word: 'hi', date },
        {
          low: 4,
          high: 22,
          word: 'hi',
        },
      ].filter(sift(query));

      expect(result).toHaveLength(2);
    });
  });
});
