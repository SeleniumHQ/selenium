# ensureSymlink(srcpath, dstpath, [type, callback])

Ensures that the symlink exists. If the directory structure does not exist, it is created.

- `srcpath` `<String>`
- `dstpath` `<String>`
- `type` `<String>`
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

const srcpath = '/tmp/file.txt'
const dstpath = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.ensureSymlink(srcpath, dstpath, err => {
  console.log(err) // => null
  // symlink has now been created, including the directory it is to be placed in
})

// With Promises:
fs.ensureSymlink(srcpath, dstpath)
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (src, dest) {
  try {
    await fs.ensureSymlink(src, dest)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

example(srcpath, dstpath)
```
