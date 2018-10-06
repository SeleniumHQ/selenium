# ensureFile(file, [callback])

Ensures that the file exists. If the file that is requested to be created is in directories that do not exist, these directories are created. If the file already exists, it is **NOT MODIFIED**.

**Alias:** `createFile()`

- `file` `<String>`
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

const file = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.ensureFile(file, err => {
  console.log(err) // => null
  // file has now been created, including the directory it is to be placed in
})

// With Promises:
fs.ensureFile(file)
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (f) {
  try {
    await fs.ensureFile(f)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

example(file)
```
