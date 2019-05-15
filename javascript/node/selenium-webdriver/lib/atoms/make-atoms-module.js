const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  process.stderr.write(`Usage: node ${path.basename(__filename)} <src file> <dst file>\n`);
  process.exit(-1);
}

const buffer = fs.readFileSync(process.argv[2]);
fs.writeFileSync(process.argv[3], `// GENERATED CODE - DO NOT EDIT
module.exports = ${buffer.toString('utf8').trim()};
`);
