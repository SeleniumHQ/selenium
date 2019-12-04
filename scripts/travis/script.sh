set -ex

if [[ $TOXENV == *"remote"* ]]; then
  ./go selenium-server-standalone
fi

# For PRs, tests will be run only when each folder, such as /py, is modified
if [[ ! -z $TOXENV ]]; then
  if [[ $TRAVIS_PULL_REQUEST == "false" ]] || git diff --name-only HEAD~1| grep '^py/' >/dev/null; then
    tox -c py/tox.ini
  fi
fi

# Ordering matters here. We want rake tasks to run first
if [[ ! -z $TASK ]]; then
  if [[ $TASK == //rb:* ]]; then
     if [[ $TRAVIS_PULL_REQUEST == "false" ]] || git diff --name-only HEAD~1| grep '^rb/' >/dev/null; then
       ./go $TASK
     fi
  else
    ./go --verbose $TASK
  fi
fi

if [[ ! -z "$BZL" ]]; then
  if [[ $BZL == test\ //javascript/* ]]; then
     if [[ $TRAVIS_PULL_REQUEST == "false" ]] || git diff --name-only HEAD~1| grep '^javascript/' >/dev/null; then
       bazel $BZL
     fi
  elif [[ $BZL == test\ * ]]; then
     if [[ $TRAVIS_PULL_REQUEST == "false" ]] || git diff --name-only HEAD~1| grep '^java/' >/dev/null; then
       bazel $BZL
     fi
  else
    bazel $BZL
  fi
fi

if [[ ! -z "$NPM" ]]; then
  if [[ $TRAVIS_PULL_REQUEST == "false" ]] || git diff --name-only HEAD~1| grep '^javascript/' >/dev/null; then
    ./go --verbose node:atoms
    cd javascript/node/selenium-webdriver; npm install; npm run $NPM
  fi
fi

if [[ ! -z "$SONAR" ]]; then
  if [[ $TRAVIS_PULL_REQUEST == "false" ]]; then
    sonar-scanner
  fi
fi