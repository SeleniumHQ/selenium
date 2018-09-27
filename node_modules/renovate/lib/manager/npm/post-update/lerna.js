const { exec } = require('child-process-promise');

module.exports = {
  generateLockFiles,
};

async function generateLockFiles(
  lernaClient,
  cwd,
  env,
  skipInstalls,
  binarySource
) {
  if (!lernaClient) {
    logger.warn('No lernaClient specified - returning');
    return { error: false };
  }
  logger.debug(`Spawning lerna with ${lernaClient} to create lock files`);
  let stdout;
  let stderr;
  let cmd;
  try {
    const startTime = process.hrtime();
    let lernaVersion;
    try {
      const pJson = JSON.parse(await platform.getFile('package.json'));
      lernaVersion =
        (pJson.dependencies && pJson.dependencies.lerna) ||
        (pJson.devDependencies && pJson.devDependencies.lerna);
    } catch (err) {
      logger.warn('Could not detect lerna version in package.json');
    }
    lernaVersion = lernaVersion || 'latest';
    logger.debug('Using lerna version ' + lernaVersion);
    let params;
    if (lernaClient === 'npm') {
      if (skipInstalls) {
        params = '--package-lock-only --no-audit';
      } else {
        params = '--ignore-scripts  --no-audit';
      }
    } else {
      params =
        '--ignore-scripts --ignore-engines --ignore-platform --mutex network:31879';
    }
    cmd = `npm i -g -C ~/.npm/lerna@${lernaVersion} lerna@${lernaVersion} && ${lernaClient} install ${params} && ~/.npm/lerna@${lernaVersion}/bin/lerna bootstrap -- ${params}`;
    if (binarySource === 'global') {
      cmd = `${lernaClient} install ${params} && lerna bootstrap -- ${params}`;
    }
    logger.debug({ cmd });
    // TODO: Switch to native util.promisify once using only node 8
    ({ stdout, stderr } = await exec(cmd, {
      cwd,
      shell: true,
      env,
    }));
    logger.debug(`npm stdout:\n${stdout}`);
    logger.debug(`npm stderr:\n${stderr}`);
    const duration = process.hrtime(startTime);
    const seconds = Math.round(duration[0] + duration[1] / 1e9);
    logger.info(
      { type: 'lerna', seconds, lernaClient, stdout, stderr },
      'Generated lockfile'
    );
  } catch (err) /* istanbul ignore next */ {
    logger.info(
      {
        cmd,
        err,
        stdout,
        stderr,
        type: 'lerna',
        lernaClient,
      },
      'lock file error'
    );
    return { error: true, stderr: stderr || err.stderr };
  }
  return { error: false };
}
