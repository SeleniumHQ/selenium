var safeStringify = require('./')
var o = {a: 1}
o.o = o

console.log(safeStringify(o))
console.log(JSON.stringify(o)) // <-- throws
