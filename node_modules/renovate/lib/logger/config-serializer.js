const traverse = require('traverse');

module.exports = configSerializer;

function configSerializer(config) {
  const redactedFields = [
    'authorization',
    'token',
    'githubAppKey',
    'npmToken',
    'npmrc',
    'yarnrc',
    'privateKey',
    'gitPrivateKey',
    'forkToken',
    'password',
  ];
  const templateFields = ['prBody'];
  const contentFields = [
    'content',
    'contents',
    'packageLockParsed',
    'yarnLockParsed',
  ];
  const arrayFields = ['packageFiles', 'upgrades'];
  // eslint-disable-next-line array-callback-return
  return traverse(config).map(function scrub(val) {
    if (val && redactedFields.includes(this.key)) {
      this.update('***********');
    }
    if (val && templateFields.includes(this.key)) {
      this.update('[Template]');
    }
    if (val && contentFields.includes(this.key)) {
      this.update('[content]');
    }
    if (val && this.key === 'releases') {
      this.update(val.map(release => release.version));
    }
    // istanbul ignore if
    if (val && arrayFields.includes(this.key)) {
      this.update('[Array]');
    }
  });
}
