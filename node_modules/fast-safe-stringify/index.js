module.exports = stringify
stringify.default = stringify
function stringify (obj) {
  decirc(obj, '', [], null)
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
  if (typeof val === 'object' && val !== null) {
    if (typeof val.toJSON === 'function') {
      if (val instanceof Circle) {
        val.count++
        return
      }
      if (val.toJSON.forceDecirc === undefined) {
        return
      }
    }
    for (var i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        parent[k] = new Circle(val, k, parent)
        return
      }
    }
    stack.push(val)
    for (var key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        decirc(val[key], key, stack, val)
      }
    }
    stack.pop()
  }
}
