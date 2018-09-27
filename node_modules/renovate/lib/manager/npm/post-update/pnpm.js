const fs = require('fs-extra');
const upath = require('upath');
const { getInstalledPath } = require('get-installed-path');
const { exec } = require('child-process-promise');

module.exports = {
  generateLockFile,
};

async function generateLockFile(cwd, env, binarySource) {
  logger.debug(`Spawning pnpm install to create ${cwd}/shrinkwrap.yaml`);
  let lockFile = null;
  let stdout;
  let stderr;
  let cmd;
  try {
    const startTime = process.hrtime();
    try {
      // See if renovate is installed locally
      const installedPath = upath.join(
        await getInstalledPath('pnpm', {
          local: true,
        }),
        'lib/bin/pnpm.js'
      );
      cmd = `node ${installedPath}`;
    } catch (localerr) {
      logger.debug('No locally installed pnpm found');
      // Look inside globally installed renovate
      try {
        const renovateLocation = await getInstalledPath('renovate');
        const installedPath = upath.join(
          await getInstalledPath('pnpm', {
            local: true,
            cwd: renovateLocation,
          }),
          'lib/bin/pnpm.js'
        );
        cmd = `node ${installedPath}`;
      } catch (nestederr) {
        logger.debug('Could not find globally nested pnpm');
        // look for global pnpm
        try {
          const installedPath = upath.join(
            await getInstalledPath('pnpm'),
            'lib/bin/pnpm.js'
          );
          cmd = `node ${installedPath}`;
        } catch (globalerr) {
          logger.warn('Could not find globally installed pnpm');
          cmd = 'pnpm';
        }
      }
    }
    if (binarySource === 'global') {
      cmd = 'pnpm';
    }
    logger.debug(`Using pnpm: ${cmd}`);
    cmd += ' install';
    cmd += ' --shrinkwrap-only';
    cmd += ' --ignore-scripts';
    cmd += ' --ignore-pnpmfile';
    // TODO: Switch to native util.promisify once using only node 8
    ({ stdout, stderr } = await exec(cmd, {
      cwd,
      shell: true,
      env,
    }));
    logger.debug(`pnpm stdout:\n${stdout}`);
    logger.debug(`pnpm stderr:\n${stderr}`);
    const duration = process.hrtime(startTime);
    const seconds = Math.round(duration[0] + duration[1] / 1e9);
    lockFile = await fs.readFile(upath.join(cwd, 'shrinkwrap.yaml'), 'utf8');
    logger.info(
      { seconds, type: 'shrinkwrap.yaml', stdout, stderr },
      'Generated lockfile'
    );
  } catch (err) /* istanbul ignore next */ {
    logger.info(
      {
        cmd,
        err,
        stdout,
        stderr,
        type: 'pnpm',
      },
      'lock file error'
    );
    return { error: true, stderr: err.stderr, stdout: err.stdout };
  }
  return { lockFile };
}
