const flat = require('flat');

const {
  equals,
  doesNotEqual,
  isGreaterThan,
  isLessThan,
  isGreaterThanOrEqualTo,
  isLessThanOrEqualTo,
  isEmpty,
  cast,
  isSerialized,
} = require('./utils');

const ops = {
  '>=': isGreaterThanOrEqualTo,
  '<=': isLessThanOrEqualTo,
  '>': isGreaterThan,
  '<': isLessThan,
  '!=': doesNotEqual,
  '=': equals,
};

const getAssignment = {
  'in': (v) => ({
    $in: v,
  }),
  'equals': cast,
  'isEmpty': cast,
  'doesNotEqual': (v) => ({
    $ne: cast(v),
  }),
  'isLessThan': (v) => ({
    $lt: cast(v),
  }),
  'isGreaterThan': (v) => ({
    $gt: cast(v),
  }),
  'isLessThanOrEqualTo': (v) => ({
    $lte: cast(v),
  }),
  'isGreaterThanOrEqualTo': (v) => ({
    $gte: cast(v),
  }),
};

const keys = Object.keys(ops);
const re = new RegExp(`[${keys.map((v) => `(${v})`).join('')}]`, 'i');

const hasLength = (v) => Array.isArray(v) && v.length;
const hasNegation = (v) => typeof v === 'string' && v.startsWith('!');

const getOp = (v) =>
  hasNegation(v)
    ? // reference the cast function conditionals
      // this leverages how wildcards work, just the inverse
      [v.replace('!', ''), '!', isEmpty]
    : keys.reduce(
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
    return hasNegation(v) || re.test(v);
  }

  get eligible() {
    return this.expressions
      .filter(Comparison.isValid)
      .map(getOp)
      .filter(hasLength);
  }

  query() {
    return {
      $and: this.eligible.reduce((a, [key, value, fn]) => {
        const v = isSerialized(value) ? value.split(',') : value;
        const name = Array.isArray(v) ? 'in' : fn.name;

        return a.concat({
          [key]: getAssignment[name](v),
        });
      }, []),
    };
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
