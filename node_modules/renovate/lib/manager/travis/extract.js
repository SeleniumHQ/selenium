const yaml = require('js-yaml');
const is = require('@sindresorhus/is');

module.exports = {
  extractDependencies,
};

function extractDependencies(content) {
  const doc = yaml.safeLoad(content);
  let deps = [];
  if (doc && is.array(doc.node_js)) {
    deps = [
      {
        depName: 'node',
        currentValue: doc.node_js,
        versionScheme: 'semver',
      },
    ];
  }
  if (!deps.length) {
    return null;
  }
  return { deps };
}
