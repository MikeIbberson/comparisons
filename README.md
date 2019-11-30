
<h1>🧮 Comparisons</h1>
<p>
<img  src="https://github.com/MikeIbberson/comparisons/workflows/Node%20CI/badge.svg"  alt="Status" />
</p> 

<p>Currently, expressions support <code>=</code>, <code>>=</code>, <code><=</code>, <code>></code> and <code><</code> operators. Optionally, you can include a second constructor argument for changing the locale (the default is "en"). Any expressions that do not match a recognized operation get stripped out and are assumed to pass.</p>

<p>Don't worry about type casting&mdash;we'll handle that for you.</p>

```Javascript
// @TODO yarn add comparisons
const Comparison = require('comparisons');

const tests = ['foo=bar', 'num>=2'];
const stub = { foo: 'bar', num: 3 };
const runner =  new  Comparison(tests);
runner.eval(stub);
```