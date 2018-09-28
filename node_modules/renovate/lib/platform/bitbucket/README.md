# Bitbucket platform

Bitbucket support is considered in "beta" release status.

## Unsupported platform features/concepts

- Adding assignees to PRs not supported (does not seem to be a Bitbucket concept)

## Features requiring implementation

- Bitbucket server not yet tested - only Bitbucket cloud
- Creating issues not implemented yet, e.g. when there is a config error
- Adding reviewers to PRs not implemented yet
- Adding comments to PRs not implemented yet, e.g. when a PR has been edited or has a lockfile error

## Known limitations/problems

Bitbucket API doesn't have any recursive file list retrieval support, so recursion to retrieve a full file list needs to be done manually via multiple API calls.

In some cases, this might add quite a lot of time and API calls to each repo. If you only require renovation of your root directory, you can set `RENOVATE_DISABLE_FILE_RECURSION=true` in env to disable recursion and speed up each run.
