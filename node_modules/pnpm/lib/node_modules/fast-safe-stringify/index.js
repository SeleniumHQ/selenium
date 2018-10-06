module.exports = stringify
stringify.default = stringify
function stringify (obj) {
  if (obj !== null && typeof obj === 'object' && typeof obj.toJSON !== 'function') {
    decirc(obj, '', [], null)
  }
  return JSON.stringify(obj)
}
function Circle (val, k, parent) {
  this.val = val
  this.k = k
  this.parent = parent
  this.count = 1
}
Circle.prototype.toJSON = function toJSON () {
  if (--this.count === 0) {
    this.parent[this.k] = this.val
  }
  return '[Circular]'
}
function decirc (val, k, stack, parent) {
  var keys, len, i
  if (typeof val !== 'object' || val === null) {
    // not an object, nothing to do
    return
  } else if (val instanceof Circle) {
    val.count++
    return
  } else if (typeof val.toJSON === 'function') {
    return
  } else if (parent) {
    if (~stack.indexOf(val)) {
      parent[k] = new Circle(val, k, parent)
      return
    }
  }
  stack.push(val)
  keys = Object.keys(val)
  len = keys.length
  i = 0
  for (; i < len; i++) {
    k = keys[i]
    decirc(val[k], k, stack, val)
  }
  stack.pop()
}
