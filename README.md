<h1>🧮 Comparisons</h1>
<p>
  <img src="https://github.com/MikeIbberson/comparisons/workflows/Node%20CI/badge.svg" alt="Status" />
</p>

<p>This package adds a new method to the String class for evaluating object key values.</p>

```Javascript
let exp;

/**
 * Alpha  
 */
exp = 'foo=bar';
exp.objectEval({ foo: 'bar' }) // true
exp.objectEval({ foo: 'quux' }) // false

/**
 * Numeric  
 */
exp = 'foo>2';
exp.objectEval({ foo: 3 }) // true
exp.objectEval({ foo: 1 }) // false

exp = 'foo<=1';
exp.objectEval({ foo: 1 }) // true
exp.objectEval({ foo: 0 }) // true

/**
 * ISO
 * Coming soon...
 */
```