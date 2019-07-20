set -ex

if [[ $TOXENV == *"remote"* ]]; then
  ./go selenium-server-standalone
fi

# Tests will be run only when each folder, such as /py, is modified
if [[ ! -z $TOXENV ]]; then
  if git diff --name-only HEAD~1| grep '^py/' >/dev/null; then
    tox -c py/tox.ini
  fi
fi

# Ordering matters here. We want rake tasks to run first
if [[ ! -z $TASK ]]; then
  if [[ $TASK == //rb:* ]]; then
     if git diff --name-only HEAD~1| grep '^rb/' >/dev/null; then
       ./go $TASK
     fi
  else
    ./go $TASK
  fi
fi

if [[ ! -z "$BUCK" ]]; then
  if [[ $BUCK == test\ //javascript/* ]]; then
     if git diff --name-only HEAD~1| grep '^javascript/' >/dev/null; then
       ./buckw $BUCK
     fi
  elif [[ $BUCK == test\ * ]]; then
     if git diff --name-only HEAD~1| grep '^java/' >/dev/null; then
       ./buckw $BUCK
     fi
  else
    ./buckw $BUCK
  fi
fi

if [[ ! -z "$NPM" ]]; then
  if git diff --name-only HEAD~1| grep '^javascript/' >/dev/null; then
    ./go node:atoms
    cd javascript/node/selenium-webdriver; npm install; npm run $NPM
  fi
fi
