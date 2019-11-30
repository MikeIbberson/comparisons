const moment = require('moment');

const validate = (v) => ({
  alpha: () => new RegExp(/^[A-Z]+$/, 'gi').test(v),
  date: () => moment(v, moment.ISO_8601, true).isValid(),
  numeric: () => !Number.isNaN(parseFloat(v)),
});

class ValidatorRunner {
  constructor(v) {
    this.values = v;
  }

  sequence(methods) {
    return methods.map((name) => this[name]()).some(Boolean);
  }

  isGreaterThanNumeric() {
    return this.$runLooseGreaterThan('numeric');
  }

  isLessThanNumeric() {
    return this.$runLooseLessThan('numeric');
  }

  isAfterDate() {
    return this.$runLooseMoment('isAfter');
  }

  isBeforeDate() {
    return this.$runLooseMoment('isBefore');
  }

  isAlphabeticallyAfter() {
    return this.$runLooseGreaterThan('alpha');
  }

  isAlphabeticallyBefore() {
    return this.$runLooseLessThan('alpha');
  }

  $run(method, next) {
    return this.values.every((value) => validate(value)[method]())
      ? next(...this.values)
      : false;
  }

  $runLooseMoment(method) {
    return this.$run('date', (a, b) => moment(a)[method](moment(b)));
  }

  $runLooseGreaterThan(method) {
    return this.$run(method, (a, b) => a > b);
  }

  $runLooseLessThan(method) {
    return this.$run(method, (a, b) => a < b);
  }
}

const equals = (a, b, locale) =>
  String(a).localeCompare(String(b), locale, {
    sensitivity: 'base',
  }) === 0;

const isGreaterThan = (a, b) =>
  new ValidatorRunner([a, b]).sequence([
    'isGreaterThanNumeric',
    'isAfterDate',
    'isAlphabeticallyAfter',
  ]);

const isLessThan = (a, b) =>
  new ValidatorRunner([a, b]).sequence([
    'isLessThanNumeric',
    'isBeforeDate',
    'isAlphabeticallyBefore',
  ]);

const isGreaterThanOrEqualTo = (a, b, locale) =>
  equals(a, b, locale) || isGreaterThan(a, b);

const isLessThanOrEqualTo = (a, b, locale) =>
  equals(a, b, locale) || isLessThan(a, b);

module.exports = {
  equals,
  isGreaterThan,
  isLessThan,
  isGreaterThanOrEqualTo,
  isLessThanOrEqualTo,
};