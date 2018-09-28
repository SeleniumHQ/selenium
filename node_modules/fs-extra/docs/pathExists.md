# pathExists(file[, callback])

Test whether or not the given path exists by checking with the file system. Like [`fs.exists`](https://nodejs.org/api/fs.html#fs_fs_exists_path_callback), but with a normal callback signature (err, exists). Uses `fs.access` under the hood.

- `file` `<String>`
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

const file = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.pathExists(file, (err, exists) => {
  console.log(err) // => null
  console.log(exists) // => false
})

// Promise usage:
fs.pathExists(file)
  .then(exists => console.log(exists)) // => false

// With async/await:
async function example (f) {
  const exists = await fs.pathExists(f)

  console.log(exists) // => false
}

example(file)
```
