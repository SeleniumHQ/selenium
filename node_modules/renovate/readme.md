![Renovate banner](https://renovatebot.com/images/design/header_small.jpg)

# Renovate

Automated dependency updates. Flexible, so you don't need to be.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://raw.githubusercontent.com/renovatebot/renovate/master/license)
[![codecov](https://codecov.io/gh/renovatebot/renovate/branch/master/graph/badge.svg)](https://codecov.io/gh/renovatebot/renovate)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

## Why Use Renovate?

- Receive automated Pull Requests whenever dependencies need updating.
- Define schedules to avoid unnecessary noise in projects (e.g. for weekends or outside of working hours, or weekly updates, etc)
- Relevant package files are discovered automatically (e.g. supports
  monorepo architecture such as lerna or yarn workspaces without further configuration)
- Bot behaviour is extremely customisable via configuration files (config as code)
- Use eslint-like shared config presets for ease of use and simplifying configuration
- Lock files are natively supported and updated in the same commit, including immediately resolving conflicts whenever PRs are merged
- Supports GitHub, GitLab, Bitbucket (beta release) and VSTS.
- Open source (installable via npm/yarn or Docker Hub) so can be self-hosted or used via GitHub App

## Who Uses Renovate?

Renovate was released in 2017 and is now widely used in the developer community. Example users include the following GitHub organisations:

[<img align="left" src="https://avatars1.githubusercontent.com/u/2034458?s=80&v=4" alt="algolia" title="algolia" hspace="10"/>](https://github.com/algolia)
[<img align="left" src="https://avatars0.githubusercontent.com/u/1342004?s=80&v=4" alt="google" title="google" hspace="10"/>](https://github.com/google)
[<img align="left" src="https://avatars2.githubusercontent.com/u/131524?s=80&v=4" alt="mozilla" title="mozilla" hspace="10"/>](https://github.com/mozilla)
[<img align="left" src="https://avatars2.githubusercontent.com/u/33676472?s=80&v=4" alt="uber-workflow" title="uber-workflow" hspace="10"/>](https://github.com/uber-workflow)
[<img align="left" src="https://avatars1.githubusercontent.com/u/22247014?s=80&v=4" alt="yarnpkg" title="yarnpkg" hspace="10"/>](https://github.com/yarnpkg)

<br /><br /><br /><br /><br />

## The Renovate Approach

- We believe everyone can benefit from automation, whether it's a little or a lot
- Renovate should not cause you to change your workflow against your wishes, instead it should be adaptable to your existing workflow
- All behaviour should be configurable, down to a ridiculous level if necessary
- Autodetect settings wherever possible (to minimise configuration) but always allow overrides

## Using Renovate

The easiest way to use Renovate if you are on GitHub is to use the Renovate app. Go to
[https://github.com/marketplace/renovate](https://github.com/marketplace/renovate) to install
it now. A paid plan is required for private repositories.

## Configuration

Visit https://renovatebot.com/docs/ for documentation, and in particular https://renovatebot.com/docs/configuration-options/ for a list of configuration options.

You can also raise an issue in https://github.com/renovatebot/config-help if you'd like to get your config reviewed or ask any questions.

## Self-Hosting

If you are not on GitHub or you prefer to run your own instance of Renovate then you have several options:

- Install the `renovate` CLI tool from npmjs
- Run the `renovate/renovate` Docker Hub image (same content/versions as the CLI tool)
- Use [Renovate Pro Edition](https://renovatebot.com/pro) available for GitHub Enterprise and soon GitLab too

## Contributing

If you would like to contribute to Renovate or get a local copy running for some other reason, please see the instructions in [contributing.md](.github/contributing.md).

## Security / Disclosure

If you discover any important bug with Renovate that may pose a security problem, please disclose it confidentially to security@renovatebot.com first, so that it can be assessed and hopefully fixed prior to being exploited. Please do not raise GitHub issues for security-related doubts or problems.
