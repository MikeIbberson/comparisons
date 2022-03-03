const flat = require('flat');
const get = require('lodash.get');

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
  'nin': (v) => ({
    $nin: v,
  }),
  'equals': cast,
  'isEmpty': cast,
  'doesNotEqual': (v) => ({
    $ne: v,
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

const isObject = (v) => typeof v === 'object';
const toPlainObject = (xs) => {
  try {
    return isObject(xs) ? JSON.parse(JSON.stringify(xs)) : xs;
  } catch (e) {
    return xs;
  }
};

const flatten = (xs) =>
  flat(toPlainObject(xs), {
    safe: true,
  });

const keys = Object.keys(ops);
const re = new RegExp(`[${keys.map((v) => `(${v})`).join('')}]`, 'i');

const TEMPLATE_VARIABLE_PATTERN = /{{(\w|\.)*}}/gi;

const isString = (v) => typeof v === 'string';

const isFn = (v) => typeof v === 'function';
const hasLength = (v) => (Array.isArray(v) && v.length) || isFn(v);

const hasNegation = (v) => isString(v) && v.startsWith('!');
const hasTemplateVariables = (v) =>
  isString(v) && new RegExp(TEMPLATE_VARIABLE_PATTERN).test(v);

const getOp = (v) => {
  // returning an object will mean that we can assemble the op response
  // based on the input eval data
  if (hasTemplateVariables(v))
    return (obj) => {
      try {
        const prop = v.split('{{')[1].split('}}')[0];
        return getOp(
          v.replace(TEMPLATE_VARIABLE_PATTERN, get(obj, prop)),
        );
      } catch (e) {
        throw new Error('Template variable not properly formatted');
      }
    };

  return hasNegation(v)
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
};

class Comparison {
  constructor(exp, locale = 'en') {
    if (Array.isArray(exp) || !isObject(exp)) {
      this.expressions = hasLength(exp) ? exp : [];
      this.operand = '$and';
    } else {
      const { operand = '$and', expressions = [] } = exp;
      this.expressions = expressions;
      this.operand = operand;
    }

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

  query(obj = {}) {
    const preflattened = flatten(obj);

    return {
      [this.operand]: this.eligible.reduce((a, params) => {
        let key;
        let value;
        let fn;

        if (Array.isArray(params)) {
          [key, value, fn] = params;
        } else if (isFn(params)) {
          [key, value, fn] = params(preflattened);
        } else {
          return a;
        }

        const v = isSerialized(value) ? value.split(',') : value;
        let { name } = fn;

        if (Array.isArray(v)) {
          name = name === 'doesNotEqual' ? 'nin' : 'in';
        }

        return a.concat({
          [key]: getAssignment[name](v),
        });
      }, []),
    };
  }

  eval(obj) {
    const method = this.operand === '$and' ? 'every' : 'some';
    const preflattened = flatten(obj);

    return this.eligible[method]((params) => {
      const [key, value, validator] = isFn(params)
        ? params(obj)
        : params;

      return isFn(validator)
        ? validator(get(preflattened, key), value, this.locale)
        : false;
    });
  }
}

module.exports = Comparison;
