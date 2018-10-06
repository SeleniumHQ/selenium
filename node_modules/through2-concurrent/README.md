through2-concurrent
===================

[![NPM](https://nodei.co/npm/through2-concurrent.png?downloads&downloadRank)](https://nodei.co/npm/through2-concurrent/)

A simple way to create a Node.JS Transform stream which processes in
parallel. You can limit the concurrency (default is 16) and order is
*not* preserved (so chunks/objects can end up in a different order to
the order they started in if the transform functions take different
amounts of time).

Built using [through2](https://github.com/rvagg/through2) and has the
same API with the addition of a `maxConcurrency` option.

Non-`objectMode` streams are supported for completeness but I'm not
sure they'd be useful for anything.

Written by Thomas Parslow
([almostobsolete.net](http://almostobsolete.net) and
[tomparslow.co.uk](http://tomparslow.co.uk)) as part of Active Inbox
([activeinboxhq.com](http://activeinboxhq.com/)).

[![Build Status](https://travis-ci.org/almost/through2-concurrent.svg)](https://travis-ci.org/almost/through2-concurrent)


Install
-------

```bash
npm install --save through2-concurrent
```

Examples
--------

Process lines from a CSV in paralel. The order the results end up in
the `all` variable is not deterministic.

```javascript
var through2Concurrent = require('through2-concurrent');

var all = [];

fs.createReadStream('data.csv')
  .pipe(csv2())
  .pipe(through2Concurrent.obj(
    {maxConcurrency: 10},
    function (chunk, enc, callback) {
      var self = this;
      someThingAsync(chunk, function (newChunk) {
        self.push(newChunk);
        callback();
      });
  }))
  .on('data', function (data) {
    all.push(data)
  })
  .on('end', function () {
    doSomethingSpecial(all)
  })
```


Contributing
------------

Fixed or improved stuff? Great! Send me a pull request [through GitHub](http://github.com/almost/through2-concurrent)
or get in touch on Twitter [@almostobsolete][#tom-twitter] or email at tom@almostobsolete.net

[#tom]: http://www.almostobsolete.net
[#tom-twitter]: https://twitter.com/almostobsolete
