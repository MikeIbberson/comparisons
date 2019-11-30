module.exports = class ComparisonCommander {
  constructor(exp, locale = 'en') {
    this.expressions = Array.isArray(exp) ? exp : [];
    this.locale = locale;
  }
};
