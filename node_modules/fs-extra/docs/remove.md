# remove(path, [callback])

Removes a file or directory. The directory can have contents. Like `rm -rf`.

- `path` `<String>`
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

// remove file
// With a callback:
fs.remove('/tmp/myfile', err => {
  if (err) return console.error(err)

  console.log('success!')
})

fs.remove('/home/jprichardson', err => {
  if (err) return console.error(err)

  console.log('success!') // I just deleted my entire HOME directory.
})

// With Promises:
fs.remove('/tmp/myfile')
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (src, dest) {
  try {
    await fs.remove('/tmp/myfile')
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

example()
```
