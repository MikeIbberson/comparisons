const flat = require('flat');

const {
  equals,
  isGreaterThan,
  isLessThan,
  isGreaterThanOrEqualTo,
  isLessThanOrEqualTo,
} = require('./utils');

const ops = {
  '>=': isGreaterThanOrEqualTo,
  '<=': isLessThanOrEqualTo,
  '>': isGreaterThan,
  '<': isLessThan,
  '=': equals,
};

const keys = Object.keys(ops);
const re = new RegExp(`[${keys.map((v) => `(${v})`).join('')}]`, 'i');

const hasLength = (v) => Array.isArray(v) && v.length;

const getOp = (v) =>
  keys.reduce(
    (a, c) =>
      v.includes(c) && !hasLength(a)
        ? v
            .split(re)
            .filter(Boolean)
            .concat(ops[c])
        : a,
    [],
  );

class Comparison {
  constructor(exp, locale = 'en') {
    this.expressions = hasLength(exp) ? exp : [];
    this.locale = locale;
  }

  static isValid(v) {
    return re.test(v);
  }

  get eligible() {
    return this.expressions
      .filter(Comparison.isValid)
      .map(getOp)
      .filter(hasLength);
  }

  eval(obj) {
    return this.eligible.every(([key, value, validator]) =>
      typeof validator === 'function'
        ? validator(flat(obj)[key], value, this.locale)
        : false,
    );
  }
}

module.exports = Comparison;
