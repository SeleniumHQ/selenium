# fast-safe-stringify

Safely and quickly serialize JavaScript objects

Detects circular dependencies instead of throwing (as per usual `JSON.stringify`
usage)

## Usage

```js
var safeStringify = require('fast-safe-stringify')
var o = { a: 1 }
o.o = o

console.log(safeStringify(o))  // '{"a":1,"o":"[Circular]"}'
console.log(JSON.stringify(o)) //<-- throws
```

### toJSON support

`fast-safe-stringify` would not attempt to detect circular dependencies on
objects that have a `toJSON` function. If you need to do that, you will need to
attach a `toJSON.forceDecirc = true` property, like so:

```js
var obj = {
  toJSON: function () {
    // something here..
    return { something: 'else' }
  }
}
obj.toJSON.forceDecirc = true
```

## Benchmarks

The [json-stringify-safe](http://npm.im/json-stringify-safe) module supplies
similar functionality with more info and flexibility.

Although not JSON, the core `util.inspect` method can be used for similar
purposes (e.g. logging) and also handles circular references.

Here we compare `fast-safe-stringify` with these alternatives:

```
inspectBench*10000: 44.441ms
jsonStringifySafeBench*10000: 38.324ms
fastSafeStringifyBench*10000: 25.165ms

inspectCircBench*10000: 66.541ms
jsonStringifyCircSafeBench*10000: 37.949ms
fastSafeStringifyCircBench*10000: 33.801ms

inspectDeepBench*10000: 377.053ms
jsonStringifySafeDeepBench*10000: 658.650ms
fastSafeStringifyDeepBench*10000: 268.092ms

inspectDeepCircBench*10000: 351.387ms
jsonStringifySafeDeepCircBench*10000: 695.964ms
fastSafeStringifyDeepCircBench*10000: 256.660ms
```

## Protip

Whether you're using `fast-safe-stringify` or `json-stringify-safe` if your use
case consists of deeply nested objects without circular references the following
pattern will give you best results:

```js
var fastSafeStringify = require('fast-safe-stringify')
function tryStringify (obj) {
  try { return JSON.stringify(obj) } catch (_) {}
}
var str = tryStringify(deep) || fastSafeStringify(deep)
```

If you're likely to be handling mostly shallow or one level nested objects, this
same pattern will degrade performance - it's entirely dependant on use case.

## JSON.stringify options

JSON.stringify's `replacer` and `space` options are not supported. Any value
other than 0 for `space` halves the speed, and providing a replacer function can
result in a segfault. Given that the primary focus of this serializer is speed,
the trade offs for supporting these options are not desirable.

## Acknowledgements

Sponsored by [nearForm](http://nearform.com)

## License

MIT

