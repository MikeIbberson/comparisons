const moment = require('moment');

const toBoolean = (v) => v === 'true';
const toMongoBoolean = (exists) => (exists ? true : { $ne: true });

const validate = (v) => ({
  alpha: () => new RegExp(/^[A-Z]+$/, 'gi').test(v),
  date: () => moment(v, moment.ISO_8601, true).isValid(),
  numeric: () => {
    const float = parseFloat(v);

    return (
      // ensure that the parsed value doesn't drop any essential characters
      // mongo's ObjectId, specifically, had this trouble
      !Number.isNaN(float) && String(float).length === String(v).length
    );
  },
  boolean: () => toBoolean(v) || v === 'false',
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

const runCompare = (a, b, locale) =>
  String(a).localeCompare(String(b), locale, {
    sensitivity: 'base',
  });

const equals = (a, b, locale) => {
  const comp = (input) => {
    const exec = (value) => runCompare(value, input, locale) === 0;
    return Array.isArray(a) ? a.some(exec) : exec(a);
  };

  if (b === '*') return a !== '' && a !== undefined && a !== null;
  if (typeof b === 'string' && b.includes(','))
    return b.split(',').some(comp);

  return comp(b);
};

const doesNotEqual = (a, b, locale) => runCompare(a, b, locale) !== 0;

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

const cast = (v) => {
  if (v === '*') return { $exists: true };
  if (v === '!') return { $eq: null };

  const test = validate(v);
  if (test.date()) return v;
  if (test.numeric()) return parseFloat(v);
  if (test.boolean()) return toMongoBoolean(toBoolean(v));
  return new RegExp(v, 'i');
};

const isEmpty = (v) =>
  v === undefined || v === null || v === 'undefined' || v === 'null';

const isSerialized = (v) => typeof v === 'string' && v.includes(',');

module.exports = {
  equals,
  doesNotEqual,
  isGreaterThan,
  isLessThan,
  isGreaterThanOrEqualTo,
  isLessThanOrEqualTo,
  isEmpty,
  validate,
  cast,
  isSerialized,
};
