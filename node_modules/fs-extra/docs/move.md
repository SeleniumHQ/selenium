# move(src, dest, [options, callback])

Moves a file or directory, even across devices.

- `src` `<String>`
- `dest` `<String>`
- `options` `<Object>`
  - `overwrite` `<boolean>`: overwrite existing file or directory, default is `false`.
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

const srcpath = '/tmp/file.txt'
const dstpath = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.move(srcpath, dstpath, err => {
  if (err) return console.error(err)

  console.log('success!')
})

// With Promises:
fs.move(srcpath, dstpath)
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (src, dest) {
  try {
    await fs.move(srcpath, dstpath)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

example(srcpath, dstpath)
```

**Using `overwrite` option**

```js
const fs = require('fs-extra')

fs.move('/tmp/somedir', '/tmp/may/already/existed/somedir', { overwrite: true }, err => {
  if (err) return console.error(err)

  console.log('success!')
})
```
