// This file is dual licensed under the terms of the Apache License, Version
// 2.0, and the BSD License. See the LICENSE file in the root of this repository
// for complete details.

const XRegExp = require('xregexp');
const {
  VERSION_PATTERN,
  explain: explainVersion,
} = require('./version');

const Operator = require('./operator');

const RANGE_PATTERN = [
  "(?<operator>(===|~=|==|!=|<=|>=|<|>))",
  "\\s*",
  "(",
    /*  */"(?<version>(" + VERSION_PATTERN.replace(/\?<\w+>/g, '?:') + "))",
    /*  */"(?<prefix>\\.\\*)?",
    /*  */"|",
    /*  */"(?<legacy>[^,;\\s)]+)",
  ")",
].join('');

module.exports = {
  RANGE_PATTERN,
  parse,
  satisfies,
  filter,
  validRange,
  maxSatisfying,
  minSatisfying,
};

const isEqualityOperator = (op) => ['==', '!=', '==='].includes(op);

const rangeRegex = new XRegExp("^" + RANGE_PATTERN + "$", 'i');

function parse(ranges) {

  if (!ranges.trim()) {
    return [];
  }

  const specifiers = ranges.split(',')
    .map(range => XRegExp.exec(range.trim(), rangeRegex))
    .map(groups => {
      if (!groups) {
        return null;
      }

      let { ...spec } = groups;
      const { operator, version, prefix, legacy } = groups;

      if (version) {
        spec = { ...spec, ...explainVersion(version) };
        if (operator === '~=') {
          if (spec.release.length < 2) {
            return null;
          }
        }
        if (!isEqualityOperator(operator) && spec.local) {
          return null;
        }

        if (prefix) {
          if (!isEqualityOperator(operator) || spec.dev || spec.local) {
            return null;
          }
        }

      }
      if (legacy && operator !== '===') {
        return null;
      }

      return spec;
    });

  if (specifiers.filter(Boolean).length !== specifiers.length) {
    return null;
  }

  return specifiers;
}

function filter(versions, specifier, options) {
  options = options || {};
  const filtered = pick(versions, specifier, options);
  if (filtered.length === 0 && options.prereleases === undefined) {
    return pick(versions, specifier, { prereleases: true });
  }
  return filtered;
}

function maxSatisfying(versions, range, options) {
  const found = filter(versions, range, options).sort(Operator.compare);
  return found.length === 0 ? null : found[found.length - 1];
};

function minSatisfying(versions, range, options) {
  const found = filter(versions, range, options).sort(Operator.compare);
  return found.length === 0 ? null : found[0];
};

function pick(versions, specifier, options) {
  const parsed = parse(specifier);

  if (!parsed) {
    return [];
  }

  return versions.filter((version) => {
    const explained = explainVersion(version);

    if (!parsed.length) {
      return explained && !(explained.is_prerelease && !options.prereleases);
    }

    return parsed.reduce((pass, spec) => {
      if (!pass) {
        return false;
      }
      return contains({ ...spec, ...options }, { version, explained });
    }, true);
  });

}

function satisfies(version, specifier, options) {

  options = options || {};
  const filtered = pick([version], specifier, options);

  return filtered.length === 1;

}

function contains(specifier, { version, explained }) {
  const { ...spec } = specifier;

  if (spec.prereleases === undefined) {
    spec.prereleases = spec.is_prerelease
  }

  if (explained && explained.is_prerelease && !spec.prereleases) {
    return false;
  }

  if (spec.operator === '~=') {
    let compatiblePrefix = spec.release.slice(0, -1).concat('*').join('.');
    if (spec.epoch) {
      compatiblePrefix = spec.epoch + '!' + compatiblePrefix;
    }
    return satisfies(version, `>=${spec.version}, ==${compatiblePrefix}`);
  }

  if (spec.prefix) {
    return version.startsWith(spec.version) === (spec.operator === '==');
  }

  if (explained) if (explained.local && spec.version) {
    version = explained.public;
    spec.version = explainVersion(spec.version).public;
  }

  if (spec.operator === '<' || spec.operator === '>') {
    // simplified version of https://www.python.org/dev/peps/pep-0440/#exclusive-ordered-comparison
    if (Operator.eq(spec.release.join('.'), explained.release.join('.'))) {
      return false;
    }
  }

  const op = Operator[spec.operator];
  return op(version, spec.version || spec.legacy);
}

function validRange(specifier) {
  return Boolean(parse(specifier));
}
