<h1>🧮 Comparisons</h1>
<p>
  <img src="https://github.com/MikeIbberson/comparisons/workflows/Node%20CI/badge.svg" alt="Status" />
</p>

<p>This package exports a class for evaluating object key values.</p>

```Javascript
/**
 * Expressions can have >, <, =, >=, <=
 * They can compare numbers, alpha and dates.
 */
const test = new Comparison(['foo=bar'])
test.eval({ foo: 'bar' }); // true
test.eval({ foo: 'quux' }); // false
```