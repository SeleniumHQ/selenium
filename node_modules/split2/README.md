# Split2(matcher, mapper, options)

[![build status](https://secure.travis-ci.org/mcollina/split2.png)](http://travis-ci.org/mcollina/split2)

Break up a stream and reassemble it so that each line is a chunk.
`split2` is inspired by [@dominictarr](https://github.com/dominictarr) [`split`](https://github.com/dominictarr) module,
and it is totally API compatible with it.
However, it is based on [`through2`](https://github.com/rvagg/through2) by [@rvagg](https://github.com/rvagg) and it is fully based on Stream3.

`matcher` may be a `String`, or a `RegExp`. Example, read every line in a file ...

``` js
  fs.createReadStream(file)
    .pipe(split2())
    .on('data', function (line) {
      //each chunk now is a seperate line!
    })

```

`split` takes the same arguments as `string.split` except it defaults to '/\r?\n/' instead of ',', and the optional `limit` paremeter is ignored.
[String#split](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/split)

`split` takes an optional options object on it's third argument, which
is directly passed as a
[Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform_1)
option.

Calling `.destroy` will make the stream emit `close`. Use this to perform cleanup logic

``` js
var splitFile = function(filename) {
  var file = fs.createReadStream(filename)

  return file
    .pipe(split2())
    .on('close', function() {
      // destroy the file stream in case the split stream was destroyed
      file.destroy()
    })
}

var stream = splitFile('my-file.txt')

stream.destroy() // will destroy the input file stream
```

# NDJ - Newline Delimited Json

`split2` accepts a function which transforms each line.

``` js
fs.createReadStream(file)
  .pipe(split2(JSON.parse))
  .on('data', function (obj) {
    //each chunk now is a a js object
  })
```

# License

Copyright (c) 2014-2016, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
