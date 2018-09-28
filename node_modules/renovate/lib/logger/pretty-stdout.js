// Code originally derived from https://github.com/hadfieldn/node-bunyan-prettystream but since heavily edited
// Neither fork nor original repo appear to be maintained

const { Stream } = require('stream');
const util = require('util');
const chalk = require('chalk');
const stringify = require('json-stringify-pretty-compact');

const bunyanFields = [
  'name',
  'hostname',
  'pid',
  'level',
  'v',
  'time',
  'msg',
  'start_time',
];
const metaFields = [
  'repository',
  'packageFile',
  'depType',
  'dependency',
  'dependencies',
  'branch',
];

const levels = {
  10: chalk.gray('TRACE'),
  20: chalk.blue('DEBUG'),
  30: chalk.green(' INFO'),
  40: chalk.magenta(' WARN'),
  50: chalk.red('ERROR'),
  60: chalk.bgRed('FATAL'),
};

function indent(str, leading = false) {
  const prefix = leading ? '       ' : '';
  return prefix + str.split(/\r?\n/).join('\n       ');
}

function getMeta(rec) {
  if (!rec) {
    return '';
  }
  let res = rec.module ? ` [${rec.module}]` : ``;
  const filteredMeta = metaFields.filter(elem => rec[elem]);
  if (!filteredMeta.length) {
    return res;
  }
  const metaStr = filteredMeta
    .map(field => `${field}=${rec[field]}`)
    .join(', ');
  res = ` (${metaStr})${res}`;
  return chalk.gray(res);
}

function getDetails(rec) {
  if (!rec) {
    return '';
  }
  const recFiltered = { ...rec };
  delete recFiltered.module;
  Object.keys(recFiltered).forEach(key => {
    if (bunyanFields.includes(key) || metaFields.includes(key)) {
      delete recFiltered[key];
    }
  });
  const remainingKeys = Object.keys(recFiltered);
  if (remainingKeys.length === 0) {
    return '';
  }
  return `${remainingKeys
    .map(key => `${indent(`"${key}": ${stringify(recFiltered[key])}`, true)}`)
    .join(',\n')}\n`;
}

// istanbul ignore next
function formatRecord(rec) {
  const level = levels[rec.level];
  const msg = `${indent(rec.msg)}`;
  const meta = getMeta(rec);
  const details = getDetails(rec);
  return util.format('%s: %s%s\n%s', level, msg, meta, details);
}

function RenovateStream() {
  this.readable = true;
  this.writable = true;
  Stream.call(this);
}

util.inherits(RenovateStream, Stream);

// istanbul ignore next
RenovateStream.prototype.write = function write(data) {
  this.emit('data', formatRecord(data));
  return true;
};

module.exports = {
  indent,
  getMeta,
  getDetails,
  formatRecord,
  RenovateStream,
};
