const is = require('@sindresorhus/is');
const { getConfigDesc } = require('./config-description');
const { getErrors, getWarnings } = require('./errors-warnings');
const { getBaseBranchDesc } = require('./base-branch');
const { getPrList } = require('./pr-list');

async function ensureOnboardingPr(config, packageFiles, branches) {
  if (config.repoIsOnboarded) {
    return;
  }
  logger.debug('ensureOnboardingPr()');
  logger.trace({ config });
  const onboardingBranch = `renovate/configure`;
  const onboardingPrTitle = 'Configure Renovate'; // Check if existing PR exists
  const existingPr = await platform.getBranchPr(onboardingBranch);
  logger.debug('Filling in onboarding PR template');
  let prTemplate = `Welcome to [Renovate](https://renovatebot.com)! This is an onboarding PR to help you understand and configure settings before regular Pull Requests begin.\n\n`;
  prTemplate += config.requireConfig
    ? `:vertical_traffic_light: To activate Renovate, merge this Pull Request. To disable Renovate, simply close this Pull Request unmerged.\n\n`
    : `:vertical_traffic_light: Renovate will begin keeping your dependencies up-to-date only once you merge or close this Pull Request.\n\n`;
  prTemplate += `

---
{{PACKAGE FILES}}
{{CONFIG}}
{{WARNINGS}}
{{ERRORS}}
{{BASEBRANCH}}
{{PRLIST}}

:question: If you have any questions, try reading the [Docs](https://renovatebot.com/docs), particularly the Getting Started section.
Also, you can post questions about your config in [Renovate's Config Help repository](https://github.com/renovatebot/config-help/issues).
`;
  let prBody = prTemplate;
  if (packageFiles && Object.entries(packageFiles).length) {
    let files = [];
    for (const [manager, managerFiles] of Object.entries(packageFiles)) {
      files = files.concat(
        managerFiles.map(file => ` * \`${file.packageFile}\` (${manager})`)
      );
    }
    prBody =
      prBody.replace(
        '{{PACKAGE FILES}}',
        '### Detected Package Files\n\n' + files.join('\n')
      ) + '\n';
  } else {
    prBody = prBody.replace('{{PACKAGE FILES}}\n', '');
  }
  let configDesc = '';
  if (!existingPr || existingPr.canRebase) {
    configDesc = getConfigDesc(config, packageFiles);
  } else {
    configDesc =
      '### Configuration\n\n:abcd: Renovate has detected a custom config for this PR. Feel free to post it to the [Config Help repository](https://github.com/renovatebot/config-help/issues) if you have any doubts and would like it reviewed.\n\n';
    if (existingPr.isConflicted) {
      configDesc +=
        ':warning: This PR has a merge conflict, however Renovate is unable to automatically fix that due to edits in this branch. Please resolve the merge conflict manually.\n\n';
    } else {
      configDesc +=
        "Important: Now that this branch is edited, Renovate can't rebase it from the base branch any more. If you make changes to the base branch that could impact this onboarding PR, please merge them manually.\n\n";
    }
  }
  prBody = prBody.replace('{{CONFIG}}\n', configDesc);
  prBody = prBody.replace('{{WARNINGS}}\n', getWarnings(config));
  prBody = prBody.replace('{{ERRORS}}\n', getErrors(config));
  prBody = prBody.replace('{{BASEBRANCH}}\n', getBaseBranchDesc(config));
  prBody = prBody.replace('{{PRLIST}}\n', getPrList(config, branches));
  // istanbul ignore if
  if (config.global) {
    if (config.global.prBanner) {
      prBody = config.global.prBanner + '\n\n' + prBody;
    }
    if (config.global.prFooter) {
      prBody = prBody + '\n---\n\n' + config.global.prFooter + '\n';
    }
  }
  logger.trace('prBody:\n' + prBody);

  prBody = platform.getPrBody(prBody);

  if (existingPr) {
    logger.info('Found open onboarding PR');
    // Check if existing PR needs updating
    if (
      existingPr.title === onboardingPrTitle &&
      existingPr.body.trim() === prBody.trim() // Bitbucket strips trailing \n
    ) {
      logger.info(`${existingPr.displayNumber} does not need updating`);
      return;
    }
    // PR must need updating
    await platform.updatePr(existingPr.number, onboardingPrTitle, prBody);
    logger.info(`Updated ${existingPr.displayNumber}`);
    return;
  }
  logger.info('Creating onboarding PR');
  const labels = [];
  const useDefaultBranch = true;
  try {
    const pr = await platform.createPr(
      onboardingBranch,
      onboardingPrTitle,
      prBody,
      labels,
      useDefaultBranch
    );
    logger.info({ pr: pr.displayNumber }, 'Created onboarding PR');
  } catch (err) /* istanbul ignore next */ {
    if (
      err.statusCode === 422 &&
      err.response &&
      err.response.body &&
      !is.empty(err.response.body.errors) &&
      err.response.body.errors[0].message &&
      err.response.body.errors[0].message.startsWith(
        'A pull request already exists'
      )
    ) {
      logger.info('Onboarding PR already exists but cannot find it');
      await platform.deleteBranch(onboardingBranch);
      return;
    }
    throw err;
  }
}

module.exports = {
  ensureOnboardingPr,
};
