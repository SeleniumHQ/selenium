const pep440 = require('@renovate/pep440');
const { filter } = require('@renovate/pep440/lib/specifier');
const { getNewValue } = require('./range');

const {
  compare: sortVersions,
  satisfies: matches,
  valid: isVersion,
  validRange,
  explain,
  gt: isGreaterThan,
  major: getMajor,
  minor: getMinor,
  patch: getPatch,
  eq: equals,
} = pep440;

const isStable = input => {
  const version = explain(input);
  if (!version) {
    return false;
  }
  return !version.is_prerelease;
};

// If this is left as an alias, inputs like "17.04.0" throw errors
const isValid = input => validRange(input);

const maxSatisfyingVersion = (versions, range) => {
  const found = filter(versions, range).sort(sortVersions);
  return found.length === 0 ? null : found[found.length - 1];
};

const minSatisfyingVersion = (versions, range) => {
  const found = filter(versions, range).sort(sortVersions);
  return found.length === 0 ? null : found[0];
};

const isSingleVersion = constraint =>
  isVersion(constraint) ||
  (constraint.startsWith('==') && isVersion(constraint.substring(2).trim()));

module.exports = {
  equals,
  getMajor,
  getMinor,
  getPatch,
  isGreaterThan,
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
