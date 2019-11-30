const Comparison = require('..');

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

  it('should return truthy', () =>
    expect(
      new Comparison([
        'foo=bar',
        'age<30',
        'age>=21',
        'language=EN',
        'bestFriend.name=jon',
      ]).eval(stub),
    ).toBeTruthy());

  it('should return falsy', () =>
    expect(
      new Comparison(['age>22', 'language=FR']).eval(stub),
    ).toBeFalsy());
});
