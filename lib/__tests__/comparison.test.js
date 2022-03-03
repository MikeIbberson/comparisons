const sift = require('sift').default;
const Comparison = require('..');

const exp = [
  'foo=bar,quuz',
  'age<30',
  'age>=21',
  'language=EN',
  'bestFriend.name=jon',
  'colleague.age=*',
  '!colour',
  'new=true',
  'old=false',
];

const stub = {
  new: true,
  colour: null,
  old: false,
  foo: 'bar',
  age: 21,
  language: ['en', 'es'],
  bestFriend: {
    name: 'Jon',
  },
  colleague: {
    age: true,
  },
  dynamic: 21,
  firstName: 'Jon',
};

describe('Comparison', () => {
  describe('isValid', () => {
    it('should return truthy', () => {
      expect(Comparison.isValid('>')).toBeTruthy();
      expect(Comparison.isValid('<')).toBeTruthy();
      expect(Comparison.isValid('>=')).toBeTruthy();
      expect(Comparison.isValid('<=')).toBeTruthy();
      expect(Comparison.isValid('!foo')).toBeTruthy();
    });
  });

  describe('eval', () => {
    it('should return truthy on dynamic matching', () =>
      expect(
        new Comparison(['dynamic={{age}}']).eval(stub),
      ).toBeTruthy());

    it('should return truthy on dynamic nested matching', () =>
      expect(
        new Comparison(['firstName={{bestFriend.name}}']).eval(stub),
      ).toBeTruthy());

    it('should return truthy', () =>
      expect(new Comparison(exp).eval(stub)).toBeTruthy());

    it('should return falsy', () =>
      expect(
        new Comparison(['age>22', 'language=FR', 'color=red']).eval(
          stub,
        ),
      ).toBeFalsy());
  });

  describe('query', () => {
    it('should return truthy on dynamic matching', () =>
      expect(
        new Comparison({
          operand: '$or',
          expressions: [
            'dynamic={{age}}',
            'foo={{deeply.deeply.nested}}',
          ],
        }).query({
          ...stub,
          deeply: { deeply: { nested: 'bar' } },
        }),
      ).toMatchObject({
        $or: [
          {
            dynamic: 21,
          },
          {
            foo: /bar/i,
          },
        ],
      }));

    it('should return as mongo query', () =>
      expect(new Comparison(exp).query(stub)).toMatchObject({
        $and: [
          { foo: /bar/gi },
          { age: { $lt: 30 } },
          { age: { $gte: 21 } },
          { language: /EN/gi },
          { 'bestFriend.name': /jon/gi },
          { 'colleague.age': { $exists: true } },
          { 'colour': { $eq: null } },
          { 'new': true },
          { 'old': { $ne: true } },
        ],
      }));

    it('should return nin', () => {
      const query = new Comparison(['language!=en,es']).query();
      expect(query.$and).toEqual([
        {
          language: { $nin: ['en', 'es'] },
        },
      ]);
    });

    it('should return in', () => {
      const query = new Comparison(['language=en,es']).query();
      expect(query.$and).toEqual([
        {
          language: { $in: ['en', 'es'] },
        },
      ]);
    });

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
