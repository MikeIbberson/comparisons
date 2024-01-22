<h1>🧮 Comparisons</h1>
<p>
<img  src="https://github.com/MikeIbberson/comparisons/workflows/Node%20CI/badge.svg"  alt="Status" />
<a href='https://coveralls.io/github/MikeIbberson/comparisons?branch=master'><img src='https://coveralls.io/repos/github/MikeIbberson/comparisons/badge.svg?branch=master' alt='Coverage Status' /></a>
<img src='https://bettercodehub.com/edge/badge/MikeIbberson/comparisons?branch=master'>
</p> 

<p>Currently, expressions support <code>=</code>, <code>>=</code>, <code><=</code>, <code>></code>, <code><</code> and <code>!=</code> operators. Optionally, you can include a second constructor argument for changing the locale (the default is "en"). Any expressions that do not match a recognized operation get stripped out and are assumed to pass.</p>

<p>For simply matching if a property exists, use the <code>=*</code> expression. Likewise, use the <code>!</code> flag on the key name to check for missing/empty values.</p>

<p>Don't worry about type casting&mdash;we'll handle that for you.</p>

<h2>Example usage</h2>

```Bash
  # Or use npm install
  yarn add comparisons
```

```Javascript
const Comparison = require('comparisons');

const tests = ['foo=bar', 'num>=2', '!quuz'];
const stub = { foo: 'bar', num: 3 };
const runner =  new  Comparison(tests);
runner.eval(stub); // returns true or false
runner.query(); // returns a Mongo friendly query
```
