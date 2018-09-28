const semver = require('../semver');

function padZeroes(input) {
  const sections = input.split('.');
  while (sections.length < 3) {
    sections.push('0');
  }
  return sections.join('.');
}

function composer2npm(input) {
  if (semver.isVersion(input)) {
    return input;
  }
  if (semver.isVersion(padZeroes(input))) {
    return padZeroes(input);
  }
  let output = input;
  // ~4 to ^4 and ~4.1 to ^4.1
  output = output.replace(/(?:^|\s)~([1-9][0-9]*(?:\.[0-9]*)?)(?: |$)/g, '^$1');
  // ~0.4 to >=0.4 <1
  output = output.replace(/(?:^|\s)~(0\.[1-9][0-9]*)(?: |$)/g, '>=$1 <1');
  return output;
}

const equals = (a, b) => semver.equals(composer2npm(a), composer2npm(b));

const getMajor = version => semver.getMajor(composer2npm(version));

const getMinor = version => semver.getMinor(composer2npm(version));

const getPatch = version => semver.getPatch(composer2npm(version));

const isGreaterThan = (a, b) =>
  semver.isGreaterThan(composer2npm(a), composer2npm(b));

const isLessThanRange = (version, range) =>
  semver.isLessThanRange(composer2npm(version), composer2npm(range));

const isSingleVersion = input => semver.isSingleVersion(composer2npm(input));

const isStable = version => semver.isStable(composer2npm(version));

const isValid = input => semver.isValid(composer2npm(input));

const isVersion = input => semver.isVersion(composer2npm(input));

const matches = (version, range) =>
  semver.matches(composer2npm(version), composer2npm(range));

const maxSatisfyingVersion = (versions, range) =>
  semver.maxSatisfyingVersion(versions.map(composer2npm), composer2npm(range));

const minSatisfyingVersion = (versions, range) =>
  semver.minSatisfyingVersion(versions.map(composer2npm), composer2npm(range));

function getNewValue(currentValue, rangeStrategy, fromVersion, toVersion) {
  const toMajor = getMajor(toVersion);
  const toMinor = getMinor(toVersion);
  let newValue;
  if (isVersion(currentValue)) {
    newValue = toVersion;
  } else if (
    semver.isValid(currentValue) &&
    composer2npm(currentValue) === currentValue
  ) {
    newValue = semver.getNewValue(
      currentValue,
      rangeStrategy,
      fromVersion,
      toVersion
    );
  } else if (currentValue.match(/^~(0\.[1-9][0-9]*)$/)) {
    // handle ~0.4 case first
    if (toMajor === 0) {
      newValue = `~0.${toMinor}`;
    } else {
      newValue = `~${toMajor}.0`;
    }
  } else if (currentValue.match(/^~([0-9]*)$/)) {
    // handle ~4 case
    newValue = `~${toMajor}`;
  } else if (currentValue.match(/^~([0-9]*(?:\.[0-9]*)?)$/)) {
    // handle ~4.1 case
    newValue = `~${toMajor}.${toMinor}`;
  }
  if (!newValue) {
    logger.warn('Unsupported composer value');
    newValue = toVersion;
  }
  if (currentValue.split('.')[0].includes('v')) {
    newValue = newValue.replace(/([0-9])/, 'v$1');
  }
  return newValue;
}

function sortVersions(a, b) {
  return semver.sortVersions(composer2npm(a), composer2npm(b));
}

module.exports = {
  equals,
  getMajor,
  getMinor,
  getPatch,
  isGreaterThan,
  isLessThanRange,
  isSingleVersion,
  isStable,
  isValid,
  isVersion,
  matches,
  maxSatisfyingVersion,
  minSatisfyingVersion,
  getNewValue,
  sortVersions,
};
